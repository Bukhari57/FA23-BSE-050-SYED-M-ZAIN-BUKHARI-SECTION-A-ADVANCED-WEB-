export const dynamic = 'force-dynamic';

import prisma from '../lib/prisma';

type LiveAd = {
  id: string;
  title: string;
  description: string;
  featured: boolean;
  package: {
    name: string;
    priority: number;
  };
  user: {
    name: string;
  };
};

type Stats = {
  total: number;
  live: number;
  submitted: number;
  scheduled: number;
  expired: number;
};

async function getLiveAds(): Promise<LiveAd[]> {
  const now = new Date();
  return prisma.ad.findMany({
    where: {
      status: 'LIVE',
      startDate: { lte: now },
      endDate: { gt: now },
    },
    include: { package: true, user: true },
    orderBy: [
      { package: { priority: 'desc' } },
      { featured: 'desc' },
      { startDate: 'desc' },
    ],
  });
}

async function getStats(): Promise<Stats> {
  const now = new Date();
  const [total, live, submitted, scheduled, expired] = await Promise.all([
    prisma.ad.count(),
    prisma.ad.count({ where: { status: 'LIVE', startDate: { lte: now }, endDate: { gt: now } } }),
    prisma.ad.count({ where: { status: 'SUBMITTED' } }),
    prisma.ad.count({ where: { status: 'SCHEDULED' } }),
    prisma.ad.count({ where: { status: 'EXPIRED' } }),
  ]);

  return { total, live, submitted, scheduled, expired };
}

async function getHomePageData() {
  try {
    const [ads, stats] = await Promise.all([getLiveAds(), getStats()]);
    return { ads, stats, error: null };
  } catch (error) {
    console.error('Database unavailable:', error);
    return {
      ads: [],
      stats: { total: 0, live: 0, submitted: 0, scheduled: 0, expired: 0 },
      error: 'Database unavailable. Check your Supabase POSTGRES URL in DATABASE_URL.',
    };
  }
}

export default async function HomePage() {
  const { ads, stats, error } = await getHomePageData();

  return (
    <main>
      <section className="mb-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Public marketplace</p>
          <h2 className="mt-3 text-4xl font-semibold text-slate-100">Live ads right now</h2>
          <p className="mt-2 max-w-2xl text-slate-400">Only verified and live ads appear on the homepage. Packages control ranking, duration, and featured promotion.</p>
        </div>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Total ads</p>
          <p className="mt-3 text-4xl font-semibold text-slate-100">{stats.total}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Live ads</p>
          <p className="mt-3 text-4xl font-semibold text-slate-100">{stats.live}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Submitted</p>
          <p className="mt-3 text-4xl font-semibold text-slate-100">{stats.submitted}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Scheduled</p>
          <p className="mt-3 text-4xl font-semibold text-slate-100">{stats.scheduled}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Expired</p>
          <p className="mt-3 text-4xl font-semibold text-slate-100">{stats.expired}</p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ads.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-8 text-center text-slate-400">
            No live ads available yet. Check back after moderation and payment verification.
          </div>
        ) : (
          ads.map((ad) => (
            <a href={`/ads/${ad.id}`} key={ad.id} className="block rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-sm shadow-slate-950/10 transition hover:border-cyan-500">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{ad.package.name}</p>
              <h3 className="mt-3 text-xl font-semibold text-slate-100">{ad.title}</h3>
              <p className="mt-2 text-slate-300">{ad.description}</p>
              <p className="mt-4 text-sm text-slate-400">By {ad.user.name}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs uppercase text-slate-500">
                <span className="rounded-full bg-slate-800 px-3 py-1">Priority {ad.package.priority}</span>
                {ad.featured ? <span className="rounded-full bg-amber-600 px-3 py-1 text-slate-950">Featured</span> : null}
              </div>
            </a>
          ))
        )}
      </section>
    </main>
  );
}
