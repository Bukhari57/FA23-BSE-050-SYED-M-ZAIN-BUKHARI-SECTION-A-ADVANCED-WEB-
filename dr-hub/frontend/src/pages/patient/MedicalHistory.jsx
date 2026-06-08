import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ClipboardIcon, PillIcon, ChevronDownIcon, InfoIcon } from '../../components/Icons';

export default function MedicalHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/history')
      .then(({ data }) => setRecords(data.data.history || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-header">Medical History</h1>
          <p className="page-subtitle">Read-only — records are permanent and cannot be modified</p>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-2 rounded-xl border border-blue-100">
          <InfoIcon className="w-3.5 h-3.5 flex-shrink-0" />
          Immutable records
        </div>
      </div>

      {/* Stats */}
      {!loading && records.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <ClipboardIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{records.length}</p>
              <p className="text-xs text-slate-500">Diagnoses</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <PillIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {records.reduce((s, r) => s + (r.prescriptions?.length || 0), 0)}
              </p>
              <p className="text-xs text-slate-500">Prescriptions</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {new Set(records.map((r) => r.doctor_id)).size}
              </p>
              <p className="text-xs text-slate-500">Doctors</p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="card h-20 animate-pulse bg-slate-100" />)}
        </div>
      ) : records.length === 0 ? (
        <div className="card p-16 flex flex-col items-center text-center">
          <ClipboardIcon className="w-14 h-14 text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium">No medical history yet</p>
          <p className="text-slate-400 text-sm mt-1">Records are added by your doctor after consultations</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-slate-200" />

          <div className="space-y-3">
            {records.map((r, idx) => (
              <div key={r.id} className="relative pl-14">
                {/* Timeline dot */}
                <div className="absolute left-3 top-4 w-5 h-5 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center z-10">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                </div>

                <div className="card overflow-hidden">
                  <button
                    onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-900">{r.diagnosis}</p>
                        {r.prescriptions?.length > 0 && (
                          <span className="badge bg-emerald-50 text-emerald-700 text-[11px]">
                            {r.prescriptions.length} Rx
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {r.doctor_name}
                        {r.specialization && ` · ${r.specialization}`}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(r.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}
                        {r.appointment_date && ` · Appointment: ${r.appointment_date}`}
                      </p>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${expanded === r.id ? 'rotate-180' : ''}`} />
                  </button>

                  {expanded === r.id && (
                    <div className="border-t border-slate-100 p-4 bg-slate-50/50 space-y-4 animate-fade-in">
                      {r.notes && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Doctor's Notes</p>
                          <p className="text-sm text-slate-700 leading-relaxed">{r.notes}</p>
                        </div>
                      )}

                      {r.prescriptions?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Prescriptions</p>
                          <div className="space-y-2">
                            {r.prescriptions.map((rx, i) => (
                              <div key={rx.id || i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                                  <PillIcon className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-xs font-semibold text-slate-600">
                                    Prescription {i + 1} · {new Date(rx.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="p-3">
                                  <div className="space-y-1">
                                    {(rx.medicines || []).map((m, j) => (
                                      <div key={j} className="flex flex-wrap gap-x-6 gap-y-0.5 text-sm py-1 border-b border-slate-50 last:border-0">
                                        <span className="font-medium text-slate-900 w-32 min-w-[8rem]">{m.name}</span>
                                        {m.dose && <span className="text-slate-500">{m.dose}</span>}
                                        {m.frequency && <span className="text-slate-500">{m.frequency}</span>}
                                        {m.duration && <span className="text-slate-400">{m.duration}</span>}
                                      </div>
                                    ))}
                                  </div>
                                  {rx.instructions && (
                                    <p className="text-xs text-slate-500 italic mt-2 pt-2 border-t border-slate-100">
                                      {rx.instructions}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
