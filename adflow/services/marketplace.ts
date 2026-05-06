import { createClient } from "@/lib/supabase/server";
import { normalizeMedia } from "@/lib/media";

interface FeaturedAdRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  featured: boolean;
  cities: { name: string }[] | null;
  categories: { name: string }[] | null;
  ad_media: { media_url: string; media_type: string; sort_order: number }[] | null;
}

interface AdMediaRow {
  media_url: string;
}

function normalizeRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function getFeaturedAds(limit = 6) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ads")
    .select("id, title, slug, description, featured, cities(name), categories(name), ad_media(media_url, media_type, sort_order)")
    .eq("status", "published")
    .order("featured", { ascending: false })
    .limit(limit);

  if (!data || data.length === 0) {
    return [
      {
        id: "demo-1",
        title: "Sponsored Electronics Mega Deal",
        slug: "sponsored-electronics-mega-deal",
        description: "Reach high-intent buyers in Karachi with premium homepage placement.",
        cities: { name: "Karachi" },
        categories: { name: "Electronics" },
        media: normalizeMedia("https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200"),
      },
    ];
  }

  return (data as FeaturedAdRow[]).map((ad) => {
    const media = ad.ad_media?.[0]?.media_url ?? "";
    return {
      ...ad,
      cities: normalizeRelation(ad.cities),
      categories: normalizeRelation(ad.categories),
      media: normalizeMedia(media),
    };
  });
}

export async function getTaxonomy() {
  const supabase = await createClient();
  const [{ data: categories }, { data: cities }, { data: packages }] = await Promise.all([
    supabase.from("categories").select("id, name, slug").order("name"),
    supabase.from("cities").select("id, name, slug").order("name"),
    supabase.from("packages").select("id, name, price_pkr, weight, duration_days, is_featured").order("price_pkr"),
  ]);

  return {
    categories: categories ?? [],
    cities: cities ?? [],
    packages: packages ?? [],
  };
}

export async function getAdBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ads")
    .select(
      "id, title, slug, description, status, published_at, expires_at, cities(name, slug), categories(name, slug), users(full_name, is_seller_verified), ad_media(media_url, media_type, sort_order)",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!data) return null;

  return {
    ...data,
    categories: normalizeRelation(data.categories),
    cities: normalizeRelation(data.cities),
    users: normalizeRelation(data.users),
    media: ((data.ad_media ?? []) as AdMediaRow[]).map((m) => normalizeMedia(m.media_url)),
  };
}

