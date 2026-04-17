import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAdBySlug } from "@/services/marketplace";

interface MediaItem {
  mediaUrl: string;
  thumbnailUrl: string;
}

export default async function AdDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ad = await getAdBySlug(slug);

  if (!ad) {
    notFound();
  }

  return (
    <main className="container py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative h-80 w-full">
              <Image src={ad.media[0]?.thumbnailUrl} alt={ad.title} fill className="object-cover" />
            </div>
            <CardContent>
              <h1 className="text-3xl font-bold text-slate-900">{ad.title}</h1>
              <p className="mt-4 whitespace-pre-wrap text-slate-700">{ad.description}</p>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-3">
            {(ad.media as MediaItem[]).slice(1).map((item, index: number) => (
              <div key={`${item.mediaUrl}-${index}`} className="relative h-40 overflow-hidden rounded-xl border border-slate-200">
                <Image src={item.thumbnailUrl} alt={ad.title} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
        <aside className="space-y-4">
          <Card>
            <CardContent className="space-y-3">
              <Badge variant="success">Published</Badge>
              <p className="text-sm text-slate-700">Category: {ad.categories?.name}</p>
              <p className="text-sm text-slate-700">City: {ad.cities?.name}</p>
              <p className="text-sm text-slate-700">Seller: {ad.users?.full_name}</p>
              {ad.users?.is_seller_verified && <Badge variant="default">Seller Verified</Badge>}
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}

