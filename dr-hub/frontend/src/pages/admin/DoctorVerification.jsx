import { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  BadgeCheckIcon, UserIcon, ShieldIcon, XIcon, CheckIcon,
} from '../../components/Icons';

export default function DoctorVerification() {
  const [doctors, setDoctors] = useState([]);
  const [tab, setTab]         = useState('pending');
  const [loading, setLoading] = useState(false);
  const [actioning, setActioning] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      if (tab === 'pending') {
        const { data } = await api.get('/admin/doctors/pending');
        setDoctors(data.data || []);
      } else {
        const { data } = await api.get('/admin/users', { params: { role: 'doctor' } });
        setDoctors((data.data.users || []).filter((u) => u.is_verified));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab]);

  const handleVerify = async (id) => {
    setActioning(id);
    try { await api.patch(`/admin/doctors/${id}/verify`); load(); }
    catch (err) { alert(err.response?.data?.message || 'Failed.'); }
    finally { setActioning(null); }
  };

  const handleUnverify = async (id) => {
    if (!confirm("Revoke this doctor's verification?")) return;
    setActioning(id);
    try { await api.patch(`/admin/doctors/${id}/unverify`); load(); }
    catch (err) { alert(err.response?.data?.message || 'Failed.'); }
    finally { setActioning(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-header">Doctor Verification</h1>
          <p className="page-subtitle">Review and verify doctor registrations</p>
        </div>
        {tab === 'pending' && doctors.length > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 text-sm font-medium px-4 py-2 rounded-xl border border-amber-100">
            <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">{doctors.length}</span>
            Awaiting Review
          </div>
        )}
      </div>

      {/* Tab selector */}
      <div className="card p-1.5 flex gap-1 w-fit">
        {[
          { key: 'pending',  label: 'Pending',  icon: ShieldIcon      },
          { key: 'verified', label: 'Verified', icon: BadgeCheckIcon  },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
              tab === key
                ? key === 'pending'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="card h-24 animate-pulse bg-slate-100" />)}
        </div>
      ) : doctors.length === 0 ? (
        <div className="card p-16 flex flex-col items-center text-center">
          {tab === 'pending' ? (
            <>
              <BadgeCheckIcon className="w-14 h-14 text-emerald-200 mb-4" />
              <p className="text-slate-500 font-medium">All caught up!</p>
              <p className="text-slate-400 text-sm mt-1">No doctors pending verification</p>
            </>
          ) : (
            <>
              <UserIcon className="w-14 h-14 text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">No verified doctors yet</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {doctors.map((d) => {
            const doctorId = d.doctor_id || d.id;
            return (
              <div key={d.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                      tab === 'pending'
                        ? 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700'
                        : 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700'
                    }`}>
                      {(d.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-900">{d.name}</p>
                        {tab === 'verified' && (
                          <BadgeCheckIcon className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{d.email}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {d.specialization && (
                          <span className="badge bg-blue-50 text-blue-700 text-[11px]">{d.specialization}</span>
                        )}
                        {d.treatment_type && (
                          <span className="badge bg-purple-50 text-purple-700 text-[11px] capitalize">{d.treatment_type}</span>
                        )}
                        {d.phone && (
                          <span className="text-xs text-slate-400">{d.phone}</span>
                        )}
                      </div>
                      {d.qualification && (
                        <p className="text-xs text-slate-400 mt-1">{d.qualification}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {tab === 'pending' ? (
                      <button
                        onClick={() => handleVerify(doctorId)}
                        disabled={actioning === doctorId}
                        className="btn-primary gap-1.5"
                      >
                        {actioning === doctorId ? 'Verifying…' : <><CheckIcon className="w-4 h-4" /> Verify</>}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnverify(doctorId)}
                        disabled={actioning === doctorId}
                        className="btn-danger gap-1.5"
                      >
                        {actioning === doctorId ? 'Revoking…' : <><XIcon className="w-4 h-4" /> Revoke</>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
