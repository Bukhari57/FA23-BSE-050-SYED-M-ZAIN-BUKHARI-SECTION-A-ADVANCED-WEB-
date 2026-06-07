import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { SearchIcon, UserIcon, BuildingIcon, BadgeCheckIcon, CalendarIcon, FilterIcon } from '../../components/Icons';

const TREATMENT_TYPES = ['', 'allopathic', 'homeopathic', 'herbal'];

export default function DoctorSearch() {
  const navigate   = useNavigate();
  const [doctors, setDoctors]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [filters, setFilters]     = useState({ search: '', treatment_type: '', city: '', disease: '' });
  const [pagination, setPagination] = useState({});
  const [page, setPage]           = useState(1);

  const fetchDoctors = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 9, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await api.get('/doctors', { params });
      setDoctors(data.data.doctors || []);
      setPagination(data.data.pagination || {});
      setPage(p);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDoctors(1); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchDoctors(1); };
  const f = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Find a Doctor</h1>
        <p className="page-subtitle">Search verified doctors and book an appointment</p>
      </div>

      {/* Filter bar */}
      <form onSubmit={handleSearch} className="card p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-56">
          <label className="label">Search</label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={filters.search} onChange={f('search')}
              placeholder="Name or specialization…" className="input pl-9" />
          </div>
        </div>
        <div className="w-44">
          <label className="label">Treatment Type</label>
          <select value={filters.treatment_type} onChange={f('treatment_type')} className="input">
            {TREATMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t ? t.charAt(0).toUpperCase() + t.slice(1) : 'All Types'}</option>
            ))}
          </select>
        </div>
        <div className="w-36">
          <label className="label">City</label>
          <input type="text" value={filters.city} onChange={f('city')}
            placeholder="Karachi…" className="input" />
        </div>
        <div className="w-44">
          <label className="label">Disease / Condition</label>
          <input type="text" value={filters.disease} onChange={f('disease')}
            placeholder="e.g. Diabetes…" className="input" />
        </div>
        <div className="pb-0.5">
          <button type="submit" className="btn-primary gap-1.5">
            <SearchIcon className="w-4 h-4" /> Search
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="card h-48 animate-pulse bg-slate-100" />)}
        </div>
      ) : doctors.length === 0 ? (
        <div className="card p-16 flex flex-col items-center text-center">
          <UserIcon className="w-14 h-14 text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium">No doctors found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your search filters</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500">{pagination.total || doctors.length} doctor{pagination.total !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doc) => (
              <div key={doc.id} className="card p-5 flex flex-col gap-4 hover:shadow-card-md transition-shadow">
                {/* Doctor info */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-blue-700">
                    {(doc.name || 'D').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-slate-900 truncate">Dr. {doc.name}</p>
                      <BadgeCheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    </div>
                    <p className="text-sm text-blue-600 font-medium">{doc.specialization}</p>
                    <span className="badge bg-slate-100 text-slate-600 text-[11px] mt-1 capitalize">{doc.treatment_type}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    {doc.experience_years > 0 ? `${doc.experience_years} yrs exp` : 'New Doctor'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    Rs. {doc.consultation_fee}
                  </div>
                  {doc.clinics?.length > 0 && (
                    <div className="flex items-center gap-1.5 col-span-2">
                      <BuildingIcon className="w-3.5 h-3.5 text-slate-400" />
                      {doc.clinics[0].city || doc.clinics[0].name}
                      {doc.clinics.length > 1 && ` +${doc.clinics.length - 1} more`}
                    </div>
                  )}
                  {(!doc.clinics || doc.clinics.length === 0) && (
                    <div className="flex items-center gap-1.5 col-span-2 text-amber-500">
                      <BuildingIcon className="w-3.5 h-3.5" />
                      No clinic set up yet
                    </div>
                  )}
                </div>

                {/* Disease tags */}
                {doc.diseases?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {doc.diseases.slice(0, 3).map((d) => (
                      <span key={d} className="badge bg-blue-50 text-blue-600 text-[11px]">{d}</span>
                    ))}
                    {doc.diseases.length > 3 && (
                      <span className="badge bg-slate-100 text-slate-500 text-[11px]">+{doc.diseases.length - 3}</span>
                    )}
                  </div>
                )}

                <button
                  onClick={() => navigate(`/patient/book/${doc.id}`)}
                  disabled={!doc.clinics || doc.clinics.length === 0}
                  className="mt-auto btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CalendarIcon className="w-4 h-4" />
                  {(!doc.clinics || doc.clinics.length === 0) ? 'No Clinic Available' : 'Book Appointment'}
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => fetchDoctors(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                    p === page ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-400'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
