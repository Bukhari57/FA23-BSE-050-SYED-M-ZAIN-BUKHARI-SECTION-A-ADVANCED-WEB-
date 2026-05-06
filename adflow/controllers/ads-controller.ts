import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adCreateSchema, adUpdateSchema } from "@/features/ads/schemas";
import { sanitizeText } from "@/lib/sanitize";
import { normalizeMedia } from "@/lib/media";
import { slugify } from "@/lib/utils";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { paginate } from "@/lib/pagination";
import { calculateAdRank } from "@/services/ranking";

interface PublicAdRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  featured: boolean;
  boost_score: number;
  published_at: string | null;
  expires_at: string | null;
  categories: { name: string; slug: string }[] | null;
  cities: { name: string; slug: string }[] | null;
  packages: { weight: number }[] | null;
  ad_media: { media_url: string; media_type: string; sort_order: number }[] | null;
}

export async function listPublicAds(url: URL) {
  const supabase = await createClient();
  const page = Number(url.searchParams.get("page") ?? 1);
  const pageSize = Number(url.searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE);
  const search = url.searchParams.get("q");
  const category = url.searchParams.get("category");
  const city = url.searchParams.get("city");

  const { from, to, safePage, safeSize } = paginate(page, pageSize);

  let query = supabase
    .from("ads")
    .select(
      "id, title, slug, description, status, featured, boost_score, published_at, expires_at, categories(name, slug), cities(name, slug), packages(weight), ad_media(media_url, media_type, sort_order)",
      { count: "exact" },
    )
    .eq("status", "published")
    .gt("expires_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (category) {
    query = query.eq("categories.slug", category);
  }
  if (city) {
    query = query.eq("cities.slug", city);
  }

  const { data, count, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const ranked = ((data ?? []) as PublicAdRow[])
    .map((row) => ({
      ...row,
      rank: calculateAdRank({
        featured: row.featured,
        packageWeight: row.packages?.[0]?.weight ?? 1,
        boostScore: row.boost_score ?? 0,
        publishedAt: row.published_at,
      }),
    }))
    .sort((a, b) => b.rank - a.rank);

  return NextResponse.json({
    data: ranked,
    pagination: {
      page: safePage,
      pageSize: safeSize,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / safeSize),
    },
  });
}

export async function createAd(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json();
  const parsed = adCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const payload = parsed.data;
  const cleanTitle = sanitizeText(payload.title);
  const cleanDescription = sanitizeText(payload.description);
  const slug = `${slugify(cleanTitle)}-${Math.random().toString(36).slice(2, 8)}`;

  const { data: ad, error } = await supabase
    .from("ads")
    .insert({
      client_id: user.id,
      title: cleanTitle,
      slug,
      description: cleanDescription,
      category_id: payload.categoryId,
      city_id: payload.cityId,
      package_id: payload.packageId,
      status: "draft",
      boost_score: payload.boostScore,
    })
    .select("id")
    .single();

  if (error || !ad) {
    return NextResponse.json({ error: error?.message ?? "Failed to create ad" }, { status: 500 });
  }

  const mediaRows = payload.mediaUrls.map((url, index) => {
    const normalized = normalizeMedia(url);
    return {
      ad_id: ad.id,
      media_url: normalized.mediaUrl,
      media_type: normalized.mediaType,
      sort_order: index,
    };
  });

  await supabase.from("ad_media").insert(mediaRows);

  return NextResponse.json({ id: ad.id, slug }, { status: 201 });
}

export async function updateAd(req: Request, id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json();
  const parsed = adUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const patch: Record<string, unknown> = {};
  if (parsed.data.title) patch.title = sanitizeText(parsed.data.title);
  if (parsed.data.description) patch.description = sanitizeText(parsed.data.description);
  if (parsed.data.categoryId) patch.category_id = parsed.data.categoryId;
  if (parsed.data.cityId) patch.city_id = parsed.data.cityId;
  if (parsed.data.packageId) patch.package_id = parsed.data.packageId;

  const { error } = await supabase.from("ads").update(patch).eq("id", id).eq("client_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}


