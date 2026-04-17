import Image from "next/image";
import Link from "next/link";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { paginate } from "@/lib/pagination";
import { normalizeMedia } from "@/lib/media";
import { calculateAdRank } from "@/services/ranking";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface ExploreAd {
  id: string;
  title: string;
  slug: string;
  description: string;
  featured: boolean;
  boost_score: number;
  published_at: string | null;
  categories: { name: string }[] | null;
  cities: { name: string }[] | null;
  packages: { weight: number }[] | null;
  ad_media: { media_url: string }[] | null;
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const q = typeof params.q === "string" ? params.q : "";
  const pageSize = DEFAULT_PAGE_SIZE;

  const supabase = await createClient();
  const { from, to, safePage, safeSize } = paginate(page, pageSize);

  let query = supabase
    .from("ads")
    .select("id, title, slug, description, featured, boost_score, published_at, categories(name), cities(name), packages(weight), ad_media(media_url)", { count: "exact" })
    .eq("status", "published")
    .gt("expires_at", new Date().toISOString())
    .range(from, to)
    .order("published_at", { ascending: false });

  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  const { data, count } = await query;

  const ranked = ((data ?? []) as ExploreAd[])
    .map((ad) => ({
      ...ad,
      media: normalizeMedia(ad.ad_media?.[0]?.media_url ?? ""),
      rank: calculateAdRank({
        featured: ad.featured,
        packageWeight: ad.packages?.[0]?.weight ?? 1,
        boostScore: ad.boost_score ?? 0,
        publishedAt: ad.published_at,
      }),
    }))
    .sort((a, b) => b.rank - a.rank);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / safeSize));

  return (
    <main className="container py-8">
      <h1 className="text-3xl font-bold text-slate-900">Explore Sponsored Listings</h1>
      <form className="mt-4 max-w-lg">
        <Input name="q" defaultValue={q} placeholder="Search ads by title or description" />
      </form>

      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {ranked.map((ad) => (
          <Link href={`/ads/${ad.slug}`} key={ad.id}>
            <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
              <div className="relative h-40 w-full">
                <Image src={ad.media.thumbnailUrl} alt={ad.title} fill className="object-cover" />
              </div>
              <CardContent>
                <p className="text-xs text-slate-500">{ad.categories?.[0]?.name} • {ad.cities?.[0]?.name}</p>
                <h2 className="mt-1 text-base font-semibold">{ad.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{ad.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between text-sm text-slate-600">
        <p>Page {safePage} of {totalPages}</p>
        <div className="flex gap-2">
          <Link
            href={`/explore?page=${Math.max(1, safePage - 1)}&q=${encodeURIComponent(q)}`}
            className="rounded-md border border-slate-300 px-3 py-1"
          >
            Previous
          </Link>
          <Link
            href={`/explore?page=${Math.min(totalPages, safePage + 1)}&q=${encodeURIComponent(q)}`}
            className="rounded-md border border-slate-300 px-3 py-1"
          >
            Next
          </Link>
        </div>
      </div>
    </main>
  );
}

