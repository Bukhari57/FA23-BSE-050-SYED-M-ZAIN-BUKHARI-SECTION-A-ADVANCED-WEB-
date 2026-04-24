import prisma from '../../../lib/prisma';

type AdCard = {
  id: string;
  title: string;
  description: string;
  featured: boolean;
  city: string | null;
  package: { name: string; priority: number };
  user: { name: string };
};

type Category = {
  id: string;
  name: string;
};

async function resolveCategory(slug: string): Promise<Category | null> {
  const categories = await prisma.category.findMany();
  return (
    categories.find((category) => category.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()) || null
  );
}

async function getAds(categoryId: string): Promise<AdCard[]> {
  const now = new Date();
  return prisma.ad.findMany({
    where: {
      categoryId,
      status: 'LIVE',
      startDate: { lte: now },
      endDate: { gt: now },
    },
    include: { package: true, user: true },
    orderBy: [{ featured: 'desc' }, { package: { priority: 'desc' } }, { startDate: 'desc' }],
  });
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await resolveCategory(params.slug);
  if (!category) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        Category not found.
      </div>
    );
  }

  const ads = await getAds(category.id);

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Category</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-100">{category.name}</h1>
        <p className="mt-4 text-slate-400">Browse active listings matched to this category.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ads.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-8 text-center text-slate-400">No live ads available for this category.</div>
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
              <p className="mt-4 text-xs uppercase tracking-[0.25em] text-slate-500">{ad.city || 'No city specified'}</p>
            </a>
          ))
        )}
      </section>
    </main>
  );
}
