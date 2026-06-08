import { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  CalendarIcon, UploadIcon, XIcon, ClockIcon, BuildingIcon, UserIcon,
} from '../../components/Icons';

const STATUSES = ['', 'pending', 'payment_uploaded', 'payment_verified', 'confirmed', 'completed', 'cancelled'];

const STATUS_CONFIG = {
  pending:          { bg: 'bg-amber-50 dark:bg-amber-900/30',    text: 'text-amber-700 dark:text-amber-400',    border: 'border-amber-200 dark:border-amber-800',   label: 'Pending Payment'   },
  payment_uploaded: { bg: 'bg-blue-50 dark:bg-blue-900/30',     text: 'text-blue-700 dark:text-blue-400',     border: 'border-blue-200 dark:border-blue-800',    label: 'Payment Uploaded'  },
  payment_verified: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800', label: 'Payment Verified'  },
  confirmed:        { bg: 'bg-emerald-50 dark:bg-emerald-900/30',text: 'text-emerald-700 dark:text-emerald-400',border: 'border-emerald-200 dark:border-emerald-800',label: 'Confirmed'         },
  completed:        { bg: 'bg-slate-100 dark:bg-slate-700',      text: 'text-slate-600 dark:text-slate-300',   border: 'border-slate-200 dark:border-slate-600',   label: 'Completed'         },
  cancelled:        { bg: 'bg-red-50 dark:bg-red-900/30',       text: 'text-red-600 dark:text-red-400',       border: 'border-red-200 dark:border-red-800',       label: 'Cancelled'         },
};

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('');
  const [uploading, setUploading]       = useState(null);

  const load = () => {
    setLoading(true);
    const params = filter ? { status: filter } : {};
    api.get('/appointments', { params })
      .then(({ data }) => setAppointments(data.data.appointments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleUpload = async (apptId, file) => {
    const fd = new FormData();
    fd.append('screenshot', file);
    setUploading(apptId);
    try {
      await api.post(`/payments/${apptId}/upload`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(null);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await api.patch(`/appointments/${id}/cancel`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancel failed.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">My Appointments</h1>
          <p className="page-subtitle">{appointments.length} appointment{appointments.length !== 1 ? 's' : ''} found</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto">
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s ? s.replace(/_/g, ' ') : 'All Status'}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map((i) => <div key={i} className="card h-36 animate-pulse bg-slate-100 dark:bg-slate-700" />)}
        </div>
      ) : appointments.length === 0 ? (
        <div className="card p-16 flex flex-col items-center text-center">
          <CalendarIcon className="w-14 h-14 text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium">No appointments found</p>
          <p className="text-slate-400 text-sm mt-1">
            {filter ? 'Try a different status filter' : 'Book your first appointment with a doctor'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => {
            const sc = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
            const needsPayment = ['pending', 'payment_uploaded'].includes(a.status) || a.payment_status === 'rejected';
            const canCancel    = !['completed', 'cancelled'].includes(a.status);

            return (
              <div key={a.id} className={`card border-l-4 ${sc.border} p-5`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Doctor avatar */}
                    <div className="w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
                      {a.profile_picture_url
                        ? <img src={a.profile_picture_url} alt={a.doctor_name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><UserIcon className="w-5 h-5 text-blue-600" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{a.doctor_name}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{a.specialization}</p>
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
                      {a.payment_status === 'rejected' && (
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1 rounded-lg">
                          <XIcon className="w-3 h-3" /> Payment rejected — please re-upload
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`badge ${sc.bg} ${sc.text}`}>{sc.label}</span>
                    {a.consultation_fee && (
                      <span className="text-xs text-slate-400">Rs. {a.consultation_fee}</span>
                    )}
                  </div>
                </div>

                {/* Payment Info — shown when patient needs to send money */}
                {needsPayment && (a.bank_account_number || a.jazzcash_number || a.easypaisa_number || a.qr_code_url) && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Send Payment To</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {a.bank_account_number && (
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Bank Transfer</p>
                          {a.bank_name && <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{a.bank_name}</p>}
                          {a.account_title && <p className="text-xs text-slate-500 dark:text-slate-400">{a.account_title}</p>}
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono tracking-wide">{a.bank_account_number}</p>
                        </div>
                      )}
                      {(a.jazzcash_number || a.easypaisa_number) && (
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 space-y-2">
                          {a.jazzcash_number && (
                            <div>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">JazzCash</p>
                              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">{a.jazzcash_number}</p>
                            </div>
                          )}
                          {a.easypaisa_number && (
                            <div>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">EasyPaisa</p>
                              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">{a.easypaisa_number}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {a.qr_code_url && (
                      <div className="mt-3">
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mb-1.5">Scan QR Code to Pay</p>
                        <img src={a.qr_code_url} alt="Payment QR Code"
                          className="w-36 h-36 object-contain border border-slate-200 dark:border-slate-600 rounded-xl bg-white p-1" />
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                {(needsPayment || canCancel) && (
                  <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                    {needsPayment && (
                      <label className={`btn-primary text-xs py-2 cursor-pointer ${uploading === a.id ? 'opacity-60 pointer-events-none' : ''}`}>
                        {uploading === a.id ? (
                          <span className="flex items-center gap-1.5">
                            <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                            Uploading…
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <UploadIcon className="w-3.5 h-3.5" />
                            {a.payment_status ? 'Re-upload Payment' : 'Upload Payment'}
                          </span>
                        )}
                        <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
                          onChange={(e) => e.target.files[0] && handleUpload(a.id, e.target.files[0])}
                          disabled={uploading === a.id} />
                      </label>
                    )}
                    {canCancel && (
                      <button onClick={() => handleCancel(a.id)} className="btn-danger text-xs py-2">
                        <XIcon className="w-3.5 h-3.5" /> Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
