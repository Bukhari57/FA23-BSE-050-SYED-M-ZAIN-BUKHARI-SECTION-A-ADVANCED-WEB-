import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  UsersIcon, PlusIcon, SearchIcon, UserIcon, BadgeCheckIcon,
  XIcon, CheckIcon, RefreshIcon, ShieldIcon,
} from '../../components/Icons';

const ALL_ROLES   = ['patient', 'doctor', 'assistant', 'admin', 'super_admin'];
const EMPTY_FORM  = {
  name: '', email: '', password: '', phone: '', role: 'patient',
  specialization: '', treatment_type: 'allopathic', consultation_fee: '', qualification: '',
  doctor_id: '',
};

const ROLE_BADGE = {
  patient:     'bg-blue-50 text-blue-700',
  doctor:      'bg-emerald-50 text-emerald-700',
  assistant:   'bg-purple-50 text-purple-700',
  admin:       'bg-amber-50 text-amber-700',
  super_admin: 'bg-rose-50 text-rose-700',
};

const doctorLabel = (doctor) => {
  if (!doctor?.name) return 'Doctor';
  return doctor.name.toLowerCase().startsWith('dr.')
    ? doctor.name
    : `Dr. ${doctor.name}`;
};

export default function AdminUsers() {
  const { user: me }                   = useAuth();
  const [users, setUsers]             = useState([]);
  const [doctors, setDoctors]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState('');
  const [roleFilter, setRoleFilter]   = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [formError, setFormError]     = useState('');
  const [saving, setSaving]           = useState(false);
  const [actioning, setActioning]     = useState(null);
  const [assigning, setAssigning]     = useState(null);
  const [assignDoctorId, setAssignDoctorId] = useState('');

  const creatable = me.role === 'super_admin'
    ? ALL_ROLES
    : ALL_ROLES.filter((r) => r !== 'admin' && r !== 'super_admin');

  const fetchUsers = async (s = search, r = roleFilter) => {
    setLoading(true);
    try {
      const params = {};
      if (s) params.search = s;
      if (r) params.role   = r;
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.data.users || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get('/admin/users', { params: { role: 'doctor', limit: 100 } });
      setDoctors(data.data.users || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDoctors();
  }, []);

  const openModal = () => {
    setForm({ ...EMPTY_FORM, role: creatable[0] });
    setFormError('');
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await api.post('/admin/users', form);
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  };

  const openAssignModal = (assistant) => {
    setAssigning(assistant);
    setAssignDoctorId(assistant.assigned_doctor_id || '');
    fetchDoctors();
  };

  const handleAssignDoctor = async (e) => {
    e.preventDefault();
    if (!assigning || !assignDoctorId) return;
    setActioning(assigning.id + '_assign');
    try {
      await api.patch(`/admin/assistants/${assigning.id}/doctor`, { doctor_id: assignDoctorId });
      setAssigning(null);
      setAssignDoctorId('');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to link assistant.');
    } finally {
      setActioning(null);
    }
  };

  const handleToggle = async (id) => {
    setActioning(id + '_toggle');
    try { await api.patch(`/admin/users/${id}/toggle`); fetchUsers(); }
    catch (err) { alert(err.response?.data?.message || 'Failed.'); }
    finally { setActioning(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this user? This cannot be undone.')) return;
    setActioning(id + '_delete');
    try { await api.delete(`/admin/users/${id}`); fetchUsers(); }
    catch (err) { alert(err.response?.data?.message || 'Failed.'); }
    finally { setActioning(null); }
  };

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">User Management</h1>
          <p className="page-subtitle">{users.length} user{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openModal} className="btn-primary">
          <PlusIcon className="w-4 h-4" /> Create User
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="card p-4 flex flex-col sm:flex-row flex-wrap gap-3 sm:items-end">
        <div className="flex-1 min-w-0 sm:min-w-48">
          <label className="label">Search</label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              placeholder="Name or email…" className="input pl-9" />
          </div>
        </div>
        <div className="w-full sm:w-44">
          <label className="label">Role</label>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input">
            <option value="">All Roles</option>
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>{r.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchUsers()} className="btn-primary gap-1.5 flex-1 sm:flex-none justify-center">
            <SearchIcon className="w-4 h-4" /> Search
          </button>
          <button onClick={() => { setSearch(''); setRoleFilter(''); fetchUsers('', ''); }}
            className="btn-ghost gap-1.5" title="Reset">
            <RefreshIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Users list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map((i) => <div key={i} className="card h-20 animate-pulse bg-slate-100" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="card p-16 flex flex-col items-center text-center">
          <UsersIcon className="w-14 h-14 text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium">No users found</p>
          {(search || roleFilter) && <p className="text-slate-400 text-sm mt-1">Try clearing your filters</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => {
            const avatarCls = u.role === 'doctor'
              ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700'
              : u.role === 'admin' || u.role === 'super_admin'
                ? 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700'
                : 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700';

            /* shared action buttons — rendered in both mobile & desktop panels */
            const actions = (
              <div className="flex items-center gap-1.5 flex-wrap">
                {u.role === 'assistant' && (
                  <button
                    onClick={() => openAssignModal(u)}
                    disabled={actioning === u.id + '_assign'}
                    className="inline-flex items-center gap-1 btn-ghost text-xs py-1.5 px-2.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <UserIcon className="w-3.5 h-3.5 shrink-0" />
                    {u.assigned_doctor_id ? 'Reassign' : 'Link Doctor'}
                  </button>
                )}
                <button
                  onClick={() => handleToggle(u.id)}
                  disabled={u.id === me.id || actioning === u.id + '_toggle'}
                  className={`inline-flex items-center gap-1 btn-ghost text-xs py-1.5 px-2.5 disabled:opacity-40 ${
                    u.is_active
                      ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                      : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {actioning === u.id + '_toggle' ? '…'
                    : u.is_active
                      ? <><XIcon className="w-3.5 h-3.5 shrink-0" /> Deactivate</>
                      : <><CheckIcon className="w-3.5 h-3.5 shrink-0" /> Activate</>}
                </button>
                {me.role === 'super_admin' && u.role !== 'super_admin' && u.id !== me.id && (
                  <button
                    onClick={() => handleDelete(u.id)}
                    disabled={actioning === u.id + '_delete'}
                    className="inline-flex items-center gap-1 btn-danger text-xs py-1.5 px-2.5"
                  >
                    {actioning === u.id + '_delete' ? '…' : <><XIcon className="w-3.5 h-3.5 shrink-0" /> Delete</>}
                  </button>
                )}
              </div>
            );

            return (
              <div key={u.id} className={`card p-4 sm:p-5 ${!u.is_active ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-3 sm:gap-4">

                  {/* Avatar */}
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${avatarCls}`}>
                    {(u.name || '?').charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Name + verification badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-semibold text-slate-900 leading-snug">{u.name}</p>
                      {u.role === 'doctor' && u.is_verified && (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <BadgeCheckIcon className="w-3 h-3 shrink-0" /> Verified
                        </span>
                      )}
                      {u.role === 'doctor' && !u.is_verified && (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                          Pending Verification
                        </span>
                      )}
                      {u.id === me.id && (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-500">
                          You
                        </span>
                      )}
                    </div>

                    {/* Email */}
                    <p className="text-sm text-slate-500 mt-0.5 truncate">{u.email}</p>
                    {u.phone && <p className="text-xs text-slate-400 mt-0.5">{u.phone}</p>}

                    {/* Doctor specialization */}
                    {u.role === 'doctor' && u.specialization && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-700">
                          {u.specialization}
                        </span>
                        {u.treatment_type && (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold bg-purple-50 text-purple-700 capitalize">
                            {u.treatment_type}
                          </span>
                        )}
                      </div>
                    )}
                    {u.role === 'doctor' && !u.specialization && (
                      <p className="text-xs text-amber-500 mt-1">Profile incomplete — no specialization set</p>
                    )}

                    {/* Assistant linked doctor */}
                    {u.role === 'assistant' && (
                      <div className="mt-2">
                        {u.assigned_doctor_name ? (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                            Linked to {doctorLabel({ name: u.assigned_doctor_name })}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-700">
                            No doctor linked
                          </span>
                        )}
                      </div>
                    )}

                    {/* ── Mobile: role + status + actions (below info) ── */}
                    <div className="mt-3 flex items-center gap-2 flex-wrap md:hidden">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${ROLE_BADGE[u.role] || 'bg-slate-100 text-slate-600'}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {actions}
                    </div>
                  </div>

                  {/* ── Desktop: role + status + actions (right panel) ── */}
                  <div className="hidden md:flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${ROLE_BADGE[u.role] || 'bg-slate-100 text-slate-600'}`}>
                      {u.role.replace('_', ' ')}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {actions}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-card-lg w-full max-w-lg animate-slide-up max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
              <div>
                <h3 className="font-bold text-slate-900">Create New User</h3>
                <p className="text-xs text-slate-400 mt-0.5">Fill in the details below</p>
              </div>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-2">
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-full">
                  <label className="label">Full Name</label>
                  <input type="text" required value={form.name} onChange={f('name')}
                    className="input" placeholder="Dr. John Doe" />
                </div>

                <div className="col-span-full">
                  <label className="label">Email</label>
                  <input type="email" required value={form.email} onChange={f('email')}
                    className="input" placeholder="user@example.com" />
                </div>

                <div>
                  <label className="label">Password</label>
                  <input type="password" required minLength={6} value={form.password} onChange={f('password')}
                    className="input" placeholder="Min. 6 chars" />
                </div>

                <div>
                  <label className="label">Phone <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input type="text" value={form.phone} onChange={f('phone')}
                    className="input" placeholder="0300-1234567" />
                </div>

                <div className="col-span-full">
                  <label className="label">Role</label>
                  <select required value={form.role} onChange={f('role')} className="input">
                    {creatable.map((r) => (
                      <option key={r} value={r}>{r.replace('_', ' ')}</option>
                    ))}
                  </select>
                  {me.role !== 'super_admin' && (
                    <p className="text-xs text-slate-400 mt-1">Admin and Super Admin roles require a Super Admin account.</p>
                  )}
                </div>
              </div>

              {/* Doctor-specific fields */}
              {form.role === 'doctor' && (
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldIcon className="w-4 h-4 text-emerald-600" />
                    <p className="text-sm font-semibold text-slate-700">Doctor Profile</p>
                  </div>

                  <div>
                    <label className="label">Specialization <span className="text-red-400">*</span></label>
                    <input type="text" required value={form.specialization} onChange={f('specialization')}
                      className="input" placeholder="e.g. Cardiologist, General Physician" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Treatment Type <span className="text-red-400">*</span></label>
                      <select required value={form.treatment_type} onChange={f('treatment_type')} className="input">
                        <option value="allopathic">Allopathic</option>
                        <option value="homeopathic">Homeopathic</option>
                        <option value="herbal">Herbal</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Consultation Fee</label>
                      <input type="number" min="0" step="0.01" value={form.consultation_fee}
                        onChange={f('consultation_fee')} className="input" placeholder="500" />
                    </div>
                  </div>

                  <div>
                    <label className="label">Qualification <span className="text-slate-400 font-normal">(optional)</span></label>
                    <input type="text" value={form.qualification} onChange={f('qualification')}
                      className="input" placeholder="MBBS, FCPS, MD…" />
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <p className="text-xs text-amber-700">
                      The doctor will appear in <strong>Doctor Verification</strong> as pending until verified by an admin.
                    </p>
                  </div>
                </div>
              )}

              {/* Assistant-specific fields */}
              {form.role === 'assistant' && (
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <UserIcon className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-semibold text-slate-700">Assistant Assignment</p>
                  </div>

                  <div>
                    <label className="label">Doctor <span className="text-red-400">*</span></label>
                    <select required value={form.doctor_id} onChange={f('doctor_id')} className="input">
                      <option value="">Select doctor</option>
                      {doctors.map((d) => (
                        <option key={d.doctor_id} value={d.doctor_id}>
                          {doctorLabel(d)}{d.specialization ? ` — ${d.specialization}` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-400 mt-1">
                      This assistant will only see and verify payments for the selected doctor.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Creating…
                    </span>
                  ) : (
                    <><PlusIcon className="w-4 h-4" /> Create User</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Assistant Modal */}
      {assigning && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAssignDoctor} className="bg-white rounded-2xl shadow-card-lg w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="font-bold text-slate-900">Link Assistant to Doctor</h3>
                <p className="text-sm text-slate-500 mt-1">{assigning.name}</p>
              </div>
              <button type="button" onClick={() => setAssigning(null)} className="btn-ghost p-2">
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <label className="label">Doctor</label>
            <select required value={assignDoctorId} onChange={(e) => setAssignDoctorId(e.target.value)} className="input">
              <option value="">Select doctor</option>
              {doctors.map((d) => (
                <option key={d.doctor_id} value={d.doctor_id}>
                  {doctorLabel(d)}{d.specialization ? ` — ${d.specialization}` : ''}
                </option>
              ))}
            </select>

            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
              After linking, this assistant can verify that doctor's payment uploads and view that doctor's appointment queue.
            </div>

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setAssigning(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={actioning === assigning.id + '_assign'} className="btn-primary flex-1">
                {actioning === assigning.id + '_assign' ? 'Saving...' : 'Save Link'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
