import prisma from '../../../lib/prisma';

type AdDetails = {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  featured: boolean;
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
    include: { package: true, user: true },
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
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{ad.package.name}</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-100">{ad.title}</h1>
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
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold text-slate-100">Media</h2>
          <p className="mt-3 text-slate-300">URL: {ad.mediaUrl}</p>
          {ad.thumbnailUrl ? <p className="mt-2 text-slate-300">Thumbnail: {ad.thumbnailUrl}</p> : null}
        </div>
      </section>
    </main>
  );
}
