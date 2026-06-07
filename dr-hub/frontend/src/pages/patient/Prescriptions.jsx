import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { PillIcon, PrintIcon, DownloadIcon, ChevronDownIcon } from '../../components/Icons';

const printPrescription = (rx, record) => {
  const medicines = (rx.medicines || []).map((m) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-weight:600;color:#0f172a">${m.name || '—'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#475569">${m.dose || '—'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#475569">${m.frequency || '—'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#475569">${m.duration || '—'}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Prescription</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #fff; color: #0f172a; padding: 40px; }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
    .logo { font-size: 24px; font-weight: 800; color: #2563eb; }
    .logo span { color: #10b981; }
    .rx-num { font-size: 12px; color: #64748b; text-align: right; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 11px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .info-item label { font-size: 11px; color: #94a3b8; display: block; }
    .info-item value { font-size: 14px; color: #0f172a; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    thead th { background: #f8fafc; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; }
    .instructions { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; margin-top: 8px; font-size: 13px; color: #166534; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }
    .signature-box { text-align: right; }
    .signature-line { border-top: 1px solid #0f172a; width: 180px; margin: 30px 0 4px auto; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Doctor<span>Hub</span></div>
      <div style="font-size:12px;color:#64748b;margin-top:4px">Digital Healthcare Platform</div>
    </div>
    <div class="rx-num">
      <div style="font-size:18px;font-weight:800;color:#2563eb">℞</div>
      <div>Prescription ID</div>
      <div style="font-family:monospace;font-size:11px">${rx.id?.slice(0,8).toUpperCase()}</div>
      <div style="margin-top:4px">Date: ${new Date(rx.created_at).toLocaleDateString('en-GB', {day:'2-digit',month:'long',year:'numeric'})}</div>
    </div>
  </div>

  <div class="info-grid section">
    <div class="info-item">
      <label>Doctor</label>
      <value>Dr. ${record.doctor_name || '—'}</value>
    </div>
    <div class="info-item">
      <label>Diagnosis</label>
      <value>${record.diagnosis || '—'}</value>
    </div>
    <div class="info-item">
      <label>Specialization</label>
      <value>${record.specialization || '—'}</value>
    </div>
    <div class="info-item">
      <label>Appointment Date</label>
      <value>${record.appointment_date || '—'}</value>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Prescribed Medicines</div>
    <table>
      <thead>
        <tr>
          <th>Medicine</th>
          <th>Dosage</th>
          <th>Frequency</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>${medicines}</tbody>
    </table>
  </div>

  ${rx.instructions ? `
  <div class="section">
    <div class="section-title">Instructions</div>
    <div class="instructions">${rx.instructions}</div>
  </div>` : ''}

  <div style="margin-top:40px">
    <div class="signature-box">
      <div class="signature-line"></div>
      <div style="font-size:13px;font-weight:600">Dr. ${record.doctor_name || '—'}</div>
      <div style="font-size:11px;color:#64748b">${record.specialization || ''}</div>
    </div>
  </div>

  <div class="footer">
    <div>⚕ Doctor Hub Healthcare Platform</div>
    <div>This is a computer-generated prescription</div>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=850,height=700');
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 500);
};

export default function PatientPrescriptions() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/history')
      .then(({ data }) => setHistory(data.data.history || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allPrescriptions = history.flatMap((h) =>
    (h.prescriptions || []).map((rx) => ({ ...rx, record: h }))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">My Prescriptions</h1>
        <p className="page-subtitle">Digital prescriptions from your doctors — printable and downloadable</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <PillIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{allPrescriptions.length}</p>
            <p className="text-xs text-slate-500">Total Prescriptions</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{history.length}</p>
            <p className="text-xs text-slate-500">Medical Records</p>
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
              {new Set(history.map((h) => h.doctor_id)).size}
            </p>
            <p className="text-xs text-slate-500">Treating Doctors</p>
          </div>
        </div>
      </div>

      {/* Prescriptions list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="card h-20 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : allPrescriptions.length === 0 ? (
        <div className="card p-16 flex flex-col items-center text-center">
          <PillIcon className="w-14 h-14 text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium">No prescriptions yet</p>
          <p className="text-slate-400 text-sm mt-1">Prescriptions from your doctors will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allPrescriptions.map((rx) => (
            <div key={rx.id} className="card overflow-hidden">
              {/* Prescription header */}
              <button
                onClick={() => setExpanded(expanded === rx.id ? null : rx.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PillIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{rx.record.diagnosis}</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Dr. {rx.record.doctor_name}
                    {rx.record.specialization && ` · ${rx.record.specialization}`}
                    {' · '}
                    {new Date(rx.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="badge bg-blue-50 text-blue-700 text-[11px]">
                    {rx.medicines?.length || 0} medicine{rx.medicines?.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); printPrescription(rx, rx.record); }}
                    className="btn-ghost py-1.5 px-2.5 gap-1 text-xs no-print"
                    title="Print"
                  >
                    <PrintIcon className="w-3.5 h-3.5" />
                  </button>
                  <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform ${expanded === rx.id ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Expanded content */}
              {expanded === rx.id && (
                <div className="border-t border-slate-100 p-5 bg-slate-50/50 animate-fade-in">
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Prescribed Medicines</p>
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            {['Medicine', 'Dosage', 'Frequency', 'Duration'].map((h) => (
                              <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {(rx.medicines || []).map((m, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="px-4 py-2.5 font-medium text-slate-900">{m.name || '—'}</td>
                              <td className="px-4 py-2.5 text-slate-500">{m.dose || '—'}</td>
                              <td className="px-4 py-2.5 text-slate-500">{m.frequency || '—'}</td>
                              <td className="px-4 py-2.5 text-slate-500">{m.duration || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {rx.instructions && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-4">
                      <p className="text-xs font-semibold text-emerald-700 mb-1">Instructions</p>
                      <p className="text-sm text-emerald-800">{rx.instructions}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => printPrescription(rx, rx.record)}
                      className="btn-primary gap-1.5 text-xs py-2"
                    >
                      <PrintIcon className="w-3.5 h-3.5" /> Print Prescription
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
