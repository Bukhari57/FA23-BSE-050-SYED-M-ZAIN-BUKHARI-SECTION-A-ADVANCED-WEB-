import prisma from '../../lib/prisma';

type Package = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  priority: number;
  featured: boolean;
};

async function getPackages(): Promise<Package[]> {
  return prisma.package.findMany({ orderBy: { priority: 'desc' } });
}

export default async function PackagesPage() {
  const packages = await getPackages();

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-4xl font-semibold text-slate-100">Packages</h1>
        <p className="mt-3 text-slate-400">Choose the package that fits your campaign and get the right ranking for your ad.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <div key={pkg.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{pkg.name}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-100">${pkg.price}</p>
            <p className="mt-2 text-slate-400">{pkg.durationDays} days • Priority {pkg.priority}</p>
            <p className="mt-4 text-slate-300">{pkg.featured ? 'Featured placement available.' : 'Standard campaign placement.'}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
