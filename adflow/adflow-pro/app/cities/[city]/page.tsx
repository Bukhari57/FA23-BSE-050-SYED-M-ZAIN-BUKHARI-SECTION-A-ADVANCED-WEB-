import prisma from '../../../lib/prisma';

type AdCard = {
  id: string;
  title: string;
  description: string;
  featured: boolean;
  category: { name: string } | null;
  package: { name: string; priority: number };
  user: { name: string };
};

async function getAds(city: string): Promise<AdCard[]> {
  const now = new Date();
  return prisma.ad.findMany({
    where: {
      city: { equals: city, mode: 'insensitive' },
      status: 'LIVE',
      startDate: { lte: now },
      endDate: { gt: now },
    },
    include: { package: true, user: true, category: true },
    orderBy: [{ featured: 'desc' }, { package: { priority: 'desc' } }, { startDate: 'desc' }],
  });
}

export default async function CityPage({ params }: { params: { city: string } }) {
  const cityName = decodeURIComponent(params.city).replace(/-/g, ' ');
  const ads = await getAds(cityName);

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">City</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-100">{cityName}</h1>
        <p className="mt-4 text-slate-400">Browse active ads available in this city or region.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ads.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-8 text-center text-slate-400">No live ads found for this city.</div>
        ) : (
          ads.map((ad) => (
            <a
              key={ad.id}
              href={`/ads/${ad.id}`}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-5 transition hover:border-cyan-500"
            >
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{ad.package.name}</p>
              <h3 className="mt-3 text-xl font-semibold text-slate-100">{ad.title}</h3>
              <p className="mt-2 text-slate-300">{ad.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase text-slate-500">
                <span className="rounded-full bg-slate-800 px-3 py-1">{ad.category?.name || 'General'}</span>
                <span className="rounded-full bg-slate-800 px-3 py-1">{cityName}</span>
              </div>
            </a>
          ))
        )}
      </section>
    </main>
  );
}
