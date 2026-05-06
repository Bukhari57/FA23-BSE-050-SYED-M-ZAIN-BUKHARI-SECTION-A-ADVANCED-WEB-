import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface BasicAdLink {
  id: string;
  title: string;
  slug: string;
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase.from("categories").select("id, name").eq("slug", slug).single();
  const { data: ads } = category
    ? await supabase
        .from("ads")
        .select("id, title, slug, status")
        .eq("category_id", category.id)
        .eq("status", "published")
        .limit(30)
    : { data: [] as BasicAdLink[] };

  return (
    <main className="container py-8">
      <h1 className="text-3xl font-bold">Category: {category?.name ?? "Unknown"}</h1>
      <div className="mt-4 space-y-2">
        {(ads ?? []).map((ad) => (
          <Link key={ad.id} href={`/ads/${ad.slug}`} className="block rounded-lg border border-slate-200 bg-white p-4 hover:bg-slate-50">
            {ad.title}
          </Link>
        ))}
      </div>
    </main>
  );
}