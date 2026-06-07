import { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  FolderIcon, UploadIcon, DownloadIcon, TrashIcon, EyeIcon,
  FilterIcon, PlusIcon, XIcon, DocumentIcon,
} from '../../components/Icons';

const CATEGORIES = [
  { value: '',                  label: 'All Reports'    },
  { value: 'lab_report',        label: 'Lab Report'     },
  { value: 'xray',              label: 'X-Ray'          },
  { value: 'mri',               label: 'MRI Scan'       },
  { value: 'ct_scan',           label: 'CT Scan'        },
  { value: 'blood_test',        label: 'Blood Test'     },
  { value: 'ultrasound',        label: 'Ultrasound'     },
  { value: 'ecg',               label: 'ECG'            },
  { value: 'prescription_upload', label: 'Prescription' },
  { value: 'other',             label: 'Other'          },
];

const CATEGORY_COLORS = {
  lab_report:          'bg-blue-100 text-blue-700',
  xray:                'bg-slate-100 text-slate-700',
  mri:                 'bg-purple-100 text-purple-700',
  ct_scan:             'bg-indigo-100 text-indigo-700',
  blood_test:          'bg-red-100 text-red-600',
  ultrasound:          'bg-cyan-100 text-cyan-700',
  ecg:                 'bg-pink-100 text-pink-700',
  prescription_upload: 'bg-emerald-100 text-emerald-700',
  other:               'bg-gray-100 text-gray-600',
};

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export default function PatientReports() {
  const [reports, setReports]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [category, setCategory]     = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState({ title: '', category: 'other', notes: '' });
  const [file, setFile]             = useState(null);
  const [uploading, setUploading]   = useState(false);
  const [uploadErr, setUploadErr]   = useState('');
  const [deleting, setDeleting]     = useState(null);

  const handleDownload = async (r) => {
    try {
      const res = await fetch(r.file_path);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = r.file_name || r.title || 'report';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(r.file_path, '_blank');
    }
  };

  const load = () => {
    setLoading(true);
    const params = category ? { category } : {};
    api.get('/reports', { params })
      .then(({ data }) => setReports(data.data.reports || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [category]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setUploadErr('Please select a file to upload.');
    setUploadErr('');
    setUploading(true);
    const fd = new FormData();
    fd.append('report', file);
    fd.append('title', form.title);
    fd.append('category', form.category);
    if (form.notes) fd.append('notes', form.notes);
    try {
      await api.post('/reports', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowModal(false);
      setForm({ title: '', category: 'other', notes: '' });
      setFile(null);
      load();
    } catch (err) {
      setUploadErr(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this report? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.delete(`/reports/${id}`);
      setReports((r) => r.filter((x) => x.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleting(null);
    }
  };

  const isImage = (name) => /\.(jpg|jpeg|png)$/i.test(name || '');
  const isPdf   = (name) => /\.pdf$/i.test(name || '');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">My Medical Reports</h1>
          <p className="page-subtitle">Upload and manage your lab results, scans, and diagnostic reports</p>
        </div>
        <button onClick={() => { setShowModal(true); setUploadErr(''); }} className="btn-primary">
          <UploadIcon className="w-4 h-4" /> Upload Report
        </button>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.slice(0, 6).map((c) => (
          <button key={c.value}
            onClick={() => setCategory(c.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 border ${
              category === c.value
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
            }`}>
            {c.label}
          </button>
        ))}
        <select
          value={CATEGORIES.slice(6).find((c) => c.value === category)?.value || ''}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 bg-white text-slate-600 focus:outline-none focus:border-blue-400"
        >
          <option value="">More…</option>
          {CATEGORIES.slice(6).map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Reports grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="card h-40 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="card p-16 flex flex-col items-center text-center">
          <FolderIcon className="w-14 h-14 text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium">No reports found</p>
          <p className="text-slate-400 text-sm mt-1">
            {category ? 'Try a different category filter' : 'Upload your first medical report to get started'}
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary mt-4">
            <UploadIcon className="w-4 h-4" /> Upload Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((r) => (
            <div key={r.id} className="card p-5 hover:shadow-card-md transition-shadow group">
              {/* File type icon */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isPdf(r.file_name) ? 'bg-red-50' : 'bg-blue-50'
                }`}>
                  {isPdf(r.file_name) ? (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.5 2.5c0 1.5-1 2.5-2.5 2.5S9.5 4 9.5 2.5V1h-6A1.5 1.5 0 002 2.5v19A1.5 1.5 0 003.5 23h17a1.5 1.5 0 001.5-1.5v-17L14.5 2.5z"/>
                    </svg>
                  ) : (
                    <DocumentIcon className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate leading-tight">{r.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{r.file_name}</p>
                </div>
              </div>

              {/* Category + date */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`badge text-[11px] ${CATEGORY_COLORS[r.category] || 'bg-gray-100 text-gray-600'}`}>
                  {CATEGORIES.find((c) => c.value === r.category)?.label || r.category}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>

              {/* File size + notes */}
              {r.file_size && <p className="text-xs text-slate-400 mb-2">{formatSize(r.file_size)}</p>}
              {r.notes && <p className="text-xs text-slate-500 italic mb-3 line-clamp-2">{r.notes}</p>}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <a
                  href={r.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 btn-ghost text-xs py-1.5 justify-center gap-1"
                >
                  <EyeIcon className="w-3.5 h-3.5" /> View
                </a>
                <button
                  onClick={() => handleDownload(r)}
                  className="flex-1 btn-ghost text-xs py-1.5 justify-center gap-1"
                >
                  <DownloadIcon className="w-3.5 h-3.5" /> Download
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={deleting === r.id}
                  className="btn-danger text-xs py-1.5 px-3 gap-1"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-card-lg w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900">Upload Medical Report</h3>
                <p className="text-xs text-slate-400 mt-0.5">Supported: JPG, PNG, PDF (max 10 MB)</p>
              </div>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-2">
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4">
              {uploadErr && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                  {uploadErr}
                </div>
              )}

              <div>
                <label className="label">Report Title</label>
                <input type="text" required value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input" placeholder="e.g. Blood Test Results - June 2026" />
              </div>

              <div>
                <label className="label">Category</label>
                <select required value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input">
                  {CATEGORIES.filter((c) => c.value).map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">File</label>
                <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                  file ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                }`}>
                  {file ? (
                    <div className="text-center">
                      <DocumentIcon className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                      <p className="text-sm font-medium text-blue-700 truncate max-w-xs px-2">{file.name}</p>
                      <p className="text-xs text-blue-500">{formatSize(file.size)}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <UploadIcon className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <p className="text-sm text-slate-500">Click to browse or drag & drop</p>
                      <p className="text-xs text-slate-400">JPG, PNG, PDF up to 10 MB</p>
                    </div>
                  )}
                  <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
                    onChange={(e) => setFile(e.target.files[0] || null)} />
                </label>
              </div>

              <div>
                <label className="label">Notes <span className="text-slate-400 font-normal">(optional)</span></label>
                <textarea rows={2} value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input resize-none"
                  placeholder="Any additional context about this report…" />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={uploading} className="btn-primary flex-1">
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Uploading…
                    </span>
                  ) : (
                    <><UploadIcon className="w-4 h-4" /> Upload</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
