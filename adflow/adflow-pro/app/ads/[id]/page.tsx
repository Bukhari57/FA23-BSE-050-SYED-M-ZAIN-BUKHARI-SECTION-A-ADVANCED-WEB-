import prisma from '../../../lib/prisma';

type AdDetails = {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  featured: boolean;
  city: string | null;
  category: { name: string } | null;
  package: {
    name: string;
    priority: number;
    durationDays: number;
  };
  user: {
    name: string;
  };
  startDate: Date | null;
  endDate: Date | null;
};

async function getAd(id: string): Promise<AdDetails | null> {
  return prisma.ad.findUnique({
    where: { id },
    include: { package: true, user: true, category: true },
  });
}

export default async function AdPage({ params }: { params: { id: string } }) {
  const ad = await getAd(params.id);
  if (!ad) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        Ad not found.
      </div>
    );
  }

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <p className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.28em] text-slate-400">{ad.package.name}</p>
          {ad.category ? <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.28em] text-slate-400">{ad.category.name}</span> : null}
          {ad.city ? <span className="rounded-full bg-cyan-600 px-3 py-1 text-xs uppercase tracking-[0.28em] text-slate-950">{ad.city}</span> : null}
        </div>
        <h1 className="mt-4 text-4xl font-semibold text-slate-100">{ad.title}</h1>
        <p className="mt-4 text-slate-300">{ad.description}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm text-slate-400">Advertiser</p>
            <p className="mt-2 text-slate-100">{ad.user.name}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm text-slate-400">Schedule</p>
            <p className="mt-2 text-slate-100">{ad.startDate ? new Date(ad.startDate).toLocaleDateString() : 'Pending'} - {ad.endDate ? new Date(ad.endDate).toLocaleDateString() : 'Pending'}</p>
          </div>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold text-slate-100">Package details</h2>
          <p className="mt-3 text-slate-300">Priority {ad.package.priority}. Runs for {ad.package.durationDays} days.</p>
          <p className="mt-2 text-slate-300">Featured: {ad.featured ? 'Yes' : 'No'}.</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold text-slate-100">Media</h2>
          <p className="mt-3 text-slate-300">URL: {ad.mediaUrl}</p>
          {ad.thumbnailUrl ? <p className="mt-2 text-slate-300">Thumbnail: {ad.thumbnailUrl}</p> : null}
        </div>
      </section>
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold text-slate-100">Need help or want to report this ad?</h2>
        <p className="mt-3 text-slate-300">If you believe this listing is suspicious or needs review, contact the team.</p>
        <a href={`/contact?subject=Report%20ad%20${ad.id}`} className="mt-4 inline-flex rounded bg-amber-500 px-5 py-3 font-semibold text-slate-950 hover:bg-amber-400">Report this ad</a>
      </section>
    </main>
  );
}
