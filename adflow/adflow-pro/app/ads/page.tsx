'use client';

import { useEffect, useMemo, useState } from 'react';

type Ad = {
  id: string;
  title: string;
  description: string;
  featured: boolean;
  city: string | null;
  category: { name: string } | null;
  package: { name: string; priority: number };
  user: { name: string };
};

type Category = { id: string; name: string };

type City = string;

type AdsResponse = {
  ads: Ad[];
  total: number;
  page: number;
  limit: number;
};

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [sort, setSort] = useState('priority');
  const [activeOnly, setActiveOnly] = useState(true);
  const [page, setPage] = useState(1);
  const [ads, setAds] = useState<Ad[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [total, setTotal] = useState(0);
  const [limit] = useState(12);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));

    fetch('/api/cities')
      .then((res) => res.json())
      .then((data) => setCities(data))
      .catch(() => setCities([]));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function loadAds() {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('public', 'true');
      params.set('page', String(page));
      params.set('limit', String(limit));
      params.set('sort', sort);
      if (query.trim()) params.set('search', query.trim());
      if (category) params.set('category', category);
      if (city) params.set('city', city);
      if (activeOnly) params.set('activeOnly', 'true');

      const response = await fetch(`/api/ads?${params.toString()}`, { signal: controller.signal });
      const body: AdsResponse = await response.json();
      setAds(body.ads);
      setTotal(body.total);
      setLoading(false);
    }

    loadAds().catch(() => setLoading(false));
    return () => controller.abort();
  }, [query, category, city, sort, activeOnly, page, limit]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  return (
    <main className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-3xl font-semibold">Explore Ads</h2>
        <p className="mt-2 text-slate-400">Search active ads by category, city, package priority and featured placement.</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <label className="block space-y-2 text-sm">
              <span>Search</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search titles or descriptions" />
            </label>
            <label className="block space-y-2 text-sm">
              <span>Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">All categories</option>
                {categories.map((option) => (
                  <option key={option.id} value={option.name}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2 text-sm">
              <span>City</span>
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">All cities</option>
                {cities.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2 text-sm">
              <span>Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="priority">Package priority</option>
                <option value="newest">Newest</option>
                <option value="featured">Featured first</option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} />
              <span>Active only</span>
            </label>
            <button
              type="button"
              onClick={() => setPage(1)}
              className="rounded bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
            >
              Reset filters
            </button>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-semibold">Browse tips</h3>
            <p className="mt-3 text-slate-400">Use categories and cities to narrow results. Featured ads are prioritized in search results.</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-semibold">Quick links</h3>
            <div className="mt-4 flex flex-col gap-3">
              <a href="/packages" className="rounded bg-slate-800 px-4 py-3 text-sm text-slate-200 hover:bg-slate-700">Packages & pricing</a>
              <a href="/faq" className="rounded bg-slate-800 px-4 py-3 text-sm text-slate-200 hover:bg-slate-700">FAQ</a>
              <a href="/contact" className="rounded bg-slate-800 px-4 py-3 text-sm text-slate-200 hover:bg-slate-700">Contact support</a>
            </div>
          </div>
        </aside>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Results</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{total} ads found</h3>
          </div>
          <p className="text-sm text-slate-400">Page {page} of {totalPages}</p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">Loading ads...</div>
        ) : ads.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-8 text-center text-slate-400">No ads found using those filters.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ads.map((ad) => (
              <a key={ad.id} href={`/ads/${ad.id}`} className="rounded-3xl border border-slate-800 bg-slate-900 p-5 transition hover:border-cyan-500">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{ad.package.name}</p>
                  {ad.featured ? <span className="rounded-full bg-amber-600 px-3 py-1 text-xs uppercase text-slate-950">Featured</span> : null}
                </div>
                <h4 className="mt-3 text-xl font-semibold text-slate-100">{ad.title}</h4>
                <p className="mt-2 text-slate-300">{ad.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase text-slate-500">
                  <span className="rounded-full bg-slate-800 px-3 py-1">{ad.category?.name || 'General'}</span>
                  {ad.city ? <span className="rounded-full bg-slate-800 px-3 py-1">{ad.city}</span> : null}
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <button
          type="button"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="rounded bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="rounded bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </section>
    </main>
  );
}
