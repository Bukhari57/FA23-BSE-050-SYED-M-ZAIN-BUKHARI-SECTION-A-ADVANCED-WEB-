import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { BuildingIcon, SearchIcon, TrashIcon, RefreshIcon } from '../../components/Icons';

export default function AdminClinics() {
  const { user }                = useAuth();
  const [clinics, setClinics]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [deleting, setDeleting] = useState(null);

  const load = async (q = search, city = cityFilter) => {
    setLoading(true);
    try {
      const params = {};
      if (q)    params.search = q;
      if (city) params.city   = city;
      const { data } = await api.get('/admin/clinics', { params });
      setClinics(data.data.clinics || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(search, cityFilter);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this clinic? This cannot be undone.')) return;
    setDeleting(id);
    try { await api.delete(`/admin/clinics/${id}`); load(); }
    catch (err) { alert(err.response?.data?.message || 'Failed.'); }
    finally { setDeleting(null); }
  };

  const cities = [...new Set(clinics.map((c) => c.city).filter(Boolean))].sort();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Clinics</h1>
          <p className="page-subtitle">{clinics.length} clinic{clinics.length !== 1 ? 's' : ''} registered</p>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="card p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="label">Search</label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Clinic name or city…"
              className="input pl-9"
            />
          </div>
        </div>
        {cities.length > 0 && (
          <div className="w-44">
            <label className="label">City</label>
            <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="input">
              <option value="">All Cities</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
        <div className="flex gap-2 pb-0.5">
          <button type="submit" className="btn-primary gap-1.5">
            <SearchIcon className="w-4 h-4" /> Search
          </button>
          <button type="button" onClick={() => { setSearch(''); setCityFilter(''); load('', ''); }}
            className="btn-ghost gap-1.5">
            <RefreshIcon className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Clinic','Address','City','Phone','Doctors', user?.role === 'super_admin' ? 'Actions' : null]
                  .filter(Boolean)
                  .map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="flex items-center justify-center gap-3 text-slate-400">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Loading clinics…
                    </div>
                  </td>
                </tr>
              ) : clinics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <BuildingIcon className="w-12 h-12 text-slate-200 mb-3" />
                      <p className="text-slate-500 font-medium">No clinics found</p>
                      {(search || cityFilter) && (
                        <p className="text-slate-400 text-xs mt-1">Try clearing your search filters</p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                clinics.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BuildingIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-semibold text-slate-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500 max-w-xs">
                      <span className="truncate block">{c.address || '—'}</span>
                    </td>
                    <td className="px-5 py-4">
                      {c.city ? (
                        <span className="badge bg-slate-100 text-slate-600 text-[11px]">{c.city}</span>
                      ) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{c.phone || '—'}</td>
                    <td className="px-5 py-4">
                      <span className="badge bg-blue-50 text-blue-700 text-[11px]">
                        {c.doctor_count || 0} doctor{c.doctor_count !== 1 ? 's' : ''}
                      </span>
                    </td>
                    {user?.role === 'super_admin' && (
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deleting === c.id}
                          className="btn-danger text-xs py-1.5 px-3 gap-1"
                        >
                          {deleting === c.id ? '…' : <><TrashIcon className="w-3.5 h-3.5" /> Delete</>}
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
