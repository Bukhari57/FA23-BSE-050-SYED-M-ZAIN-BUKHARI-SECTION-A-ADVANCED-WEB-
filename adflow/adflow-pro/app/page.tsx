export const dynamic = 'force-dynamic';

import prisma from '../lib/prisma';

type LiveAd = {
  id: string;
  title: string;
  description: string;
  featured: boolean;
  city: string | null;
  category: { name: string } | null;
  package: {
    name: string;
    priority: number;
  };
  user: {
    name: string;
  };
};

type Package = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  priority: number;
  featured: boolean;
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
    include: { package: true, user: true, category: true },
    orderBy: [
      { package: { priority: 'desc' } },
      { featured: 'desc' },
      { startDate: 'desc' },
    ],
  });
}

async function getPackages(): Promise<Package[]> {
  return prisma.package.findMany({
    orderBy: { priority: 'desc' },
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
    const [ads, packages, stats] = await Promise.all([getLiveAds(), getPackages(), getStats()]);
    return { ads, packages, stats, error: null };
  } catch (error) {
    console.error('Database unavailable:', error);
    return {
      ads: [],
      packages: [],
      stats: { total: 0, live: 0, submitted: 0, scheduled: 0, expired: 0 },
      error: 'Database unavailable. Check your Supabase POSTGRES URL in DATABASE_URL.',
    };
  }
}

export default async function HomePage() {
  const { ads, packages, stats } = await getHomePageData();
  const featuredAds = ads.filter((ad) => ad.featured).slice(0, 3);
  const recentAds = ads.slice(0, 6);

  return (
    <main className="space-y-10">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/20">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">AdFlow Pro</p>
            <h2 className="text-5xl font-semibold text-white">A moderated marketplace for trusted ad listings.</h2>
            <p className="max-w-2xl text-xl text-slate-400">Create ads, submit payment proof, and get fast review by moderators. Explore active local ads, discover featured campaigns, and reach buyers with priority placement.</p>
            <div className="flex flex-wrap gap-3">
              <a href="/ads" className="rounded bg-cyan-600 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-500">Explore ads</a>
              <a href="/packages" className="rounded border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500">View packages</a>
            </div>
          </div>
          <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950 p-6">
            <div className="space-y-3 rounded-3xl bg-slate-900 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">What you can do</p>
              <ul className="space-y-2 text-slate-300">
                <li>• Create draft ads and manage your workflow</li>
                <li>• Submit payment proof for fast approval</li>
                <li>• Discover verified and featured listings</li>
              </ul>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-sm text-slate-500">Live listings</p>
                <p className="mt-2 text-3xl font-semibold text-white">{stats.live}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-sm text-slate-500">Verified reviews</p>
                <p className="mt-2 text-3xl font-semibold text-white">{stats.submitted}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-semibold">Why trust AdFlow Pro?</h3>
          <div className="mt-6 space-y-4 text-slate-300">
            <div className="rounded-3xl bg-slate-950 p-4">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Moderated</p>
              <p className="mt-2">Ads are reviewed for quality, category fit, and suspicious media before they go live.</p>
            </div>
            <div className="rounded-3xl bg-slate-950 p-4">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Verified payments</p>
              <p className="mt-2">Payment proof is tracked and verified, then listings are scheduled or published.</p>
            </div>
            <div className="rounded-3xl bg-slate-950 p-4">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Priority placement</p>
              <p className="mt-2">Featured packages increase ranking and homepage visibility for top campaigns.</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-semibold">Browse packages</h3>
          <div className="mt-4 space-y-4">
            {packages.slice(0, 3).map((pkg) => (
              <div key={pkg.id} className="rounded-3xl border border-slate-700 bg-slate-950 p-4">
                <p className="font-semibold text-slate-100">{pkg.name}</p>
                <p className="text-sm text-slate-400">{pkg.durationDays} days • Priority {pkg.priority}</p>
                <p className="mt-2 text-slate-300">${pkg.price} per listing</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-semibold">Learning hub</h3>
          <div className="mt-4 space-y-4 text-slate-300">
            <div className="rounded-3xl bg-slate-950 p-4">
              <p className="text-sm font-semibold text-slate-100">How do I submit ads?</p>
              <p className="mt-2 text-sm">Create a draft, upload proof, and let the moderator verify your listing.</p>
            </div>
            <div className="rounded-3xl bg-slate-950 p-4">
              <p className="text-sm font-semibold text-slate-100">What makes a featured ad?</p>
              <p className="mt-2 text-sm">Featured ads get higher priority, homepage exposure, and better visibility.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Featured campaigns</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">Top ads right now</h3>
          </div>
          <a href="/ads" className="rounded bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700">Explore all live ads</a>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredAds.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-8 text-center text-slate-400">No featured ads are live at the moment.</div>
          ) : (
            featuredAds.map((ad) => (
              <a key={ad.id} href={`/ads/${ad.id}`} className="rounded-3xl border border-slate-800 bg-slate-900 p-5 transition hover:border-cyan-500">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{ad.package.name}</p>
                <h4 className="mt-3 text-xl font-semibold text-slate-100">{ad.title}</h4>
                <p className="mt-2 text-slate-300">{ad.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase text-slate-500">
                  <span className="rounded-full bg-slate-800 px-3 py-1">{ad.category?.name ?? 'General'}</span>
                  {ad.city ? <span className="rounded-full bg-slate-800 px-3 py-1">{ad.city}</span> : null}
                </div>
              </a>
            ))
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Recent listings</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">Newest verified ads</h3>
            </div>
            <a href="/ads" className="text-sm text-cyan-400 hover:underline">Browse all</a>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentAds.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-8 text-center text-slate-400">No recent ads available yet.</div>
          ) : (
            recentAds.map((ad) => (
              <a key={ad.id} href={`/ads/${ad.id}`} className="rounded-3xl border border-slate-800 bg-slate-900 p-5 transition hover:border-cyan-500">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{ad.category?.name ?? 'General'}</p>
                <h4 className="mt-3 text-xl font-semibold text-slate-100">{ad.title}</h4>
                <p className="mt-2 text-slate-300">{ad.description}</p>
                <p className="mt-3 text-sm text-slate-400">{ad.city || 'No city specified'}</p>
              </a>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
