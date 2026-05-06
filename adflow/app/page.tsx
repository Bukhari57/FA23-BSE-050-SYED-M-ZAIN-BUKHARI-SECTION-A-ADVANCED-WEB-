import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getFeaturedAds, getTaxonomy } from "@/services/marketplace";

interface LandingAd {
  id: string;
  title: string;
  slug: string;
  description: string;
  categories?: { name: string } | null;
  cities?: { name: string } | null;
  media: { thumbnailUrl: string };
}

interface TaxonomyItem {
  id: string;
  name: string;
  slug: string;
}

export default async function HomePage() {
  const [featured, taxonomy] = await Promise.all([getFeaturedAds(), getTaxonomy()]);

  return (
    <main className="container py-10">
      <section className="animate-rise rounded-3xl bg-gradient-to-br from-sky-700 via-cyan-700 to-teal-700 p-8 text-white lg:p-12">
        <p className="text-sm uppercase tracking-[0.2em] text-sky-100">AdFlow Pro</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight lg:text-5xl">
          Launch premium sponsored listings with a strict moderation and payment verification workflow.
        </h1>
        <p className="mt-4 max-w-2xl text-sky-50">
          Clients submit ads, moderators screen content, admins verify payments, and only approved active listings go live.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/explore">
            <Button size="lg" variant="secondary">
              Explore Listings <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/packages">
            <Button size="lg" className="bg-white/15 hover:bg-white/25">
              View Packages
            </Button>
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {[{ icon: ShieldCheck, title: "Moderated", text: "Every ad goes through role-based checks." }, { icon: TrendingUp, title: "Ranked", text: "Featured weight, freshness, and boosts decide visibility." }, { icon: ArrowRight, title: "Automated", text: "Cron jobs publish schedules and expire old listings." }].map((item) => (
          <Card key={item.title}>
            <CardContent className="p-5">
              <item.icon className="h-5 w-5 text-cyan-700" />
              <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.text}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Featured Listings</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(featured as LandingAd[]).map((ad) => (
            <Link key={ad.id} href={`/ads/${ad.slug}`}>
              <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
                <div className="relative h-44 w-full">
                  <Image src={ad.media.thumbnailUrl} alt={ad.title} fill className="object-cover" />
                </div>
                <CardContent>
                  <p className="text-xs text-cyan-700">{ad.categories?.name} • {ad.cities?.name}</p>
                  <h3 className="mt-2 text-base font-semibold text-slate-900">{ad.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{ad.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h3 className="text-lg font-semibold">Top Categories</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(taxonomy.categories as TaxonomyItem[]).slice(0, 8).map((category) => (
                <Link key={category.id} href={`/categories/${category.slug}`} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                  {category.name}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h3 className="text-lg font-semibold">Top Cities</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(taxonomy.cities as TaxonomyItem[]).slice(0, 8).map((city) => (
                <Link key={city.id} href={`/cities/${city.slug}`} className="rounded-full bg-cyan-50 px-3 py-1 text-sm text-cyan-800">
                  {city.name}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

