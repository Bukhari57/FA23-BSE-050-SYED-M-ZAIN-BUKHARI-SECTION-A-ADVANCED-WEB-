import { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  CalendarIcon, UserIcon, ClockIcon, BuildingIcon, CheckIcon,
} from '../../components/Icons';

const STATUS_CONFIG = {
  pending:          { bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-l-amber-400',   label: 'Pending'          },
  payment_uploaded: { bg: 'bg-blue-50',     text: 'text-blue-700',    border: 'border-l-blue-400',    label: 'Payment Uploaded' },
  payment_verified: { bg: 'bg-indigo-50',   text: 'text-indigo-700',  border: 'border-l-indigo-400',  label: 'Payment Verified' },
  confirmed:        { bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-l-emerald-400', label: 'Confirmed'        },
  completed:        { bg: 'bg-slate-100',   text: 'text-slate-600',   border: 'border-l-slate-300',   label: 'Completed'        },
  cancelled:        { bg: 'bg-red-50',      text: 'text-red-600',     border: 'border-l-red-400',     label: 'Cancelled'        },
};

const STATUSES = ['', 'pending', 'payment_uploaded', 'confirmed', 'completed', 'cancelled'];

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('');
  const [completing, setCompleting]     = useState(null);

  const load = () => {
    setLoading(true);
    const params = filter ? { status: filter } : {};
    api.get('/appointments', { params })
      .then(({ data }) => setAppointments(data.data.appointments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleComplete = async (id) => {
    if (!confirm('Mark this appointment as completed?')) return;
    setCompleting(id);
    try {
      await api.patch(`/appointments/${id}/complete`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed.');
    } finally {
      setCompleting(null);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Appointments</h1>
          <p className="page-subtitle">{appointments.length} appointment{appointments.length !== 1 ? 's' : ''}</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto">
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s ? s.replace(/_/g, ' ') : 'All Status'}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="card h-28 animate-pulse bg-slate-100" />)}
        </div>
      ) : appointments.length === 0 ? (
        <div className="card p-16 flex flex-col items-center text-center">
          <CalendarIcon className="w-14 h-14 text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium">No appointments found</p>
          <p className="text-slate-400 text-sm mt-1">Try a different status filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => {
            const sc = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
            const isToday = a.appointment_date === today;
            return (
              <div key={a.id} className={`card border-l-4 ${sc.border} p-5`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-900">{a.patient_name}</p>
                        {isToday && (
                          <span className="badge bg-blue-600 text-white text-[11px]">Today</span>
                        )}
                      </div>
                      {a.patient_phone && <p className="text-xs text-slate-500 mt-0.5">{a.patient_phone}</p>}
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {new Date(`${a.appointment_date}T12:00:00`).toLocaleDateString('en-GB', { weekday:'short', day:'2-digit', month:'short', year:'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-3.5 h-3.5" />
                          {a.appointment_time?.slice(0, 5)}
                        </span>
                        <span className="flex items-center gap-1">
                          <BuildingIcon className="w-3.5 h-3.5" />
                          {a.clinic_name}
                        </span>
                      </div>
                      {a.patient_notes && (
                        <p className="text-xs text-slate-400 mt-1.5 italic">"{a.patient_notes}"</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`badge ${sc.bg} ${sc.text}`}>{sc.label}</span>
                    {a.status === 'confirmed' && (
                      <button
                        onClick={() => handleComplete(a.id)}
                        disabled={completing === a.id}
                        className="btn-primary text-xs py-1.5 gap-1"
                      >
                        {completing === a.id ? 'Saving…' : <><CheckIcon className="w-3.5 h-3.5" /> Mark Complete</>}
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
