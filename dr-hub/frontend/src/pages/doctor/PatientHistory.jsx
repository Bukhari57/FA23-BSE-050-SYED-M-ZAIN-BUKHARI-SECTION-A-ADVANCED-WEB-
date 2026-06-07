import { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  ClipboardIcon, PillIcon, PlusIcon, CheckIcon, ChevronDownIcon,
  UserIcon, CalendarIcon,
} from '../../components/Icons';

const TABS = [
  { key: 'history',          label: 'History',          icon: ClipboardIcon },
  { key: 'add record',       label: 'Add Record',       icon: PlusIcon      },
  { key: 'add prescription', label: 'Add Prescription', icon: PillIcon      },
];

export default function PatientHistory() {
  const [history, setHistory]   = useState([]);
  const [appts, setAppts]       = useState([]);
  const [selected, setSelected] = useState('');
  const [form, setForm]         = useState({ patient_id:'', appointment_id:'', diagnosis:'', notes:'' });
  const [rxForm, setRxForm]     = useState({ medicines:[{ name:'', dose:'', frequency:'', duration:'' }], instructions:'' });
  const [tab, setTab]           = useState('history');
  const [expanded, setExpanded] = useState(null);
  const [msg, setMsg]           = useState('');
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);

  const loadHistory = () =>
    api.get('/history').then(({ data }) => setHistory(data.data.history || [])).catch(console.error);
  const loadAppts = () =>
    api.get('/appointments', { params: { limit: 100 } })
      .then(({ data }) => {
        const all = data.data.appointments || [];
        setAppts(all.filter((a) => ['confirmed', 'completed'].includes(a.status)));
      }).catch(console.error);

  useEffect(() => { loadHistory(); loadAppts(); }, []);

  const notify = (success, txt) => {
    if (success) setMsg(txt); else setError(txt);
    setTimeout(() => { setMsg(''); setError(''); }, 4000);
  };

  const addHistory = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/history', form);
      setForm({ patient_id:'', appointment_id:'', diagnosis:'', notes:'' });
      loadHistory();
      notify(true, 'Medical record added successfully.');
      setTab('history');
    } catch (err) { notify(false, err.response?.data?.message || 'Failed to add record.'); }
    finally { setSaving(false); }
  };

  const addRx = async (e) => {
    e.preventDefault();
    if (!selected) return notify(false, 'Please select a history record first.');
    setSaving(true);
    try {
      await api.post(`/history/${selected}/prescriptions`, rxForm);
      setRxForm({ medicines:[{ name:'', dose:'', frequency:'', duration:'' }], instructions:'' });
      setSelected('');
      loadHistory();
      notify(true, 'Prescription added successfully.');
      setTab('history');
    } catch (err) { notify(false, err.response?.data?.message || 'Failed to add prescription.'); }
    finally { setSaving(false); }
  };

  const updateMed = (i, key, val) => {
    const meds = [...rxForm.medicines];
    meds[i] = { ...meds[i], [key]: val };
    setRxForm({ ...rxForm, medicines: meds });
  };

  const removeMed = (i) => {
    if (rxForm.medicines.length === 1) return;
    setRxForm({ ...rxForm, medicines: rxForm.medicines.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Patient History</h1>
        <p className="page-subtitle">Add and review medical records and prescriptions</p>
      </div>

      {/* Tabs */}
      <div className="card p-1.5 flex gap-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              tab === key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Alerts */}
      {msg   && <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2"><CheckIcon className="w-4 h-4 flex-shrink-0" />{msg}</div>}
      {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {/* History tab */}
      {tab === 'history' && (
        history.length === 0 ? (
          <div className="card p-16 flex flex-col items-center text-center">
            <ClipboardIcon className="w-14 h-14 text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">No records yet</p>
            <p className="text-slate-400 text-sm mt-1">Add a medical record to get started</p>
            <button onClick={() => setTab('add record')} className="btn-primary mt-4">
              <PlusIcon className="w-4 h-4" /> Add First Record
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((r) => (
              <div key={r.id} className="card overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-blue-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900">{r.patient_name}</p>
                      {r.prescriptions?.length > 0 && (
                        <span className="badge bg-emerald-50 text-emerald-700 text-[11px]">
                          {r.prescriptions.length} Rx
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5">{r.diagnosis}</p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      {new Date(r.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
                    </p>
                  </div>
                  <ChevronDownIcon className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${expanded === r.id ? 'rotate-180' : ''}`} />
                </button>

                {expanded === r.id && (
                  <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-4 animate-fade-in">
                    {r.notes && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Doctor's Notes</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{r.notes}</p>
                      </div>
                    )}
                    {r.prescriptions?.length > 0 ? (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Prescriptions</p>
                        <div className="space-y-2">
                          {r.prescriptions.map((rx, i) => (
                            <div key={rx.id || i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                                <PillIcon className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-xs font-semibold text-slate-600">
                                  Prescription {i+1} — {new Date(rx.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <table className="w-full text-sm">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                  <tr>
                                    {['Medicine','Dose','Frequency','Duration'].map((h) => (
                                      <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                  {(rx.medicines || []).map((m, j) => (
                                    <tr key={j}>
                                      <td className="px-4 py-2 font-medium text-slate-900">{m.name||'—'}</td>
                                      <td className="px-4 py-2 text-slate-500">{m.dose||'—'}</td>
                                      <td className="px-4 py-2 text-slate-500">{m.frequency||'—'}</td>
                                      <td className="px-4 py-2 text-slate-500">{m.duration||'—'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {rx.instructions && (
                                <div className="px-4 py-2.5 bg-emerald-50 border-t border-emerald-100">
                                  <p className="text-xs text-emerald-700">{rx.instructions}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setSelected(r.id); setTab('add prescription'); }}
                        className="btn-ghost text-xs py-1.5 gap-1 text-emerald-600 hover:text-emerald-700">
                        <PillIcon className="w-3.5 h-3.5" /> Add Prescription to this record
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Add Record tab */}
      {tab === 'add record' && (
        <form onSubmit={addHistory} className="card p-6 space-y-5">
          <div>
            <label className="label">Confirmed Appointment</label>
            <select required value={form.appointment_id}
              onChange={(e) => {
                const a = appts.find((x) => x.id === e.target.value);
                setForm({ ...form, appointment_id: e.target.value, patient_id: a?.patient_id || '' });
              }}
              className="input">
              <option value="">Select appointment…</option>
              {appts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.patient_name} · {a.appointment_date} {a.appointment_time?.slice(0,5)}
                </option>
              ))}
            </select>
            {appts.length === 0 && (
              <p className="text-xs text-amber-600 mt-1.5">No confirmed appointments available.</p>
            )}
          </div>
          <div>
            <label className="label">Diagnosis</label>
            <input type="text" required value={form.diagnosis}
              onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
              className="input" placeholder="e.g. Hypertension Stage 1" />
          </div>
          <div>
            <label className="label">Doctor's Notes <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea rows={4} value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input resize-none"
              placeholder="Observations, test results, follow-up instructions…" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setTab('history')} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving…' : <><CheckIcon className="w-4 h-4" /> Save Record</>}
            </button>
          </div>
        </form>
      )}

      {/* Add Prescription tab */}
      {tab === 'add prescription' && (
        <form onSubmit={addRx} className="card p-6 space-y-5">
          <div>
            <label className="label">History Record</label>
            <select value={selected} onChange={(e) => setSelected(e.target.value)} className="input">
              <option value="">Choose medical record…</option>
              {history.map((r) => (
                <option key={r.id} value={r.id}>{r.patient_name} — {r.diagnosis}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Medicines</label>
            <div className="space-y-2">
              {rxForm.medicines.map((m, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="grid grid-cols-4 gap-2 flex-1">
                    {[
                      { key: 'name',      ph: 'Medicine name', req: true  },
                      { key: 'dose',      ph: 'Dosage',        req: false },
                      { key: 'frequency', ph: 'Frequency',     req: false },
                      { key: 'duration',  ph: 'Duration',      req: false },
                    ].map(({ key, ph, req }) => (
                      <input key={key} type="text" placeholder={ph} required={req}
                        value={m[key]} onChange={(e) => updateMed(i, key, e.target.value)}
                        className="input text-sm py-2" />
                    ))}
                  </div>
                  {rxForm.medicines.length > 1 && (
                    <button type="button" onClick={() => removeMed(i)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1 flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button"
              onClick={() => setRxForm({ ...rxForm, medicines: [...rxForm.medicines, { name:'', dose:'', frequency:'', duration:'' }] })}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              <PlusIcon className="w-3.5 h-3.5" /> Add another medicine
            </button>
          </div>

          <div>
            <label className="label">Instructions <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea rows={2} value={rxForm.instructions}
              onChange={(e) => setRxForm({ ...rxForm, instructions: e.target.value })}
              className="input resize-none"
              placeholder="e.g. Take after meals, avoid dairy products…" />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setTab('history')} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving…' : <><PillIcon className="w-4 h-4" /> Save Prescription</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
