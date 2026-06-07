import { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  UserIcon, BuildingIcon, CalendarIcon, PlusIcon, CheckIcon,
  TrashIcon, ClockIcon, BadgeCheckIcon, EditIcon, ShieldIcon,
} from '../../components/Icons';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

const DAY_SHORT = { monday:'Mon', tuesday:'Tue', wednesday:'Wed', thursday:'Thu', friday:'Fri', saturday:'Sat', sunday:'Sun' };

const EMPTY_CLINIC   = { name:'', address:'', city:'', phone:'' };
const EMPTY_SCHEDULE = { clinic_id:'', day:'monday', start_time:'09:00', end_time:'17:00', slot_duration_mins:30 };

export default function DoctorProfile() {
  const [profile, setProfile]     = useState(null);
  const [form, setForm]           = useState({});
  const [disease, setDisease]     = useState('');
  const [clinic, setClinic]       = useState(EMPTY_CLINIC);
  const [schedule, setSchedule]   = useState(EMPTY_SCHEDULE);
  const [activeTab, setActiveTab] = useState('profile');
  const [msg, setMsg]             = useState('');
  const [error, setError]         = useState('');
  const [saving, setSaving]       = useState(false);

  const load = () => {
    api.get('/doctors/profile/me')
      .then(({ data }) => {
        setProfile(data.data);
        const d = data.data;
        setForm({
          specialization:    d.specialization    || '',
          qualification:     d.qualification     || '',
          experience_years:  d.experience_years  ?? '',
          consultation_fee:  d.consultation_fee  ?? '',
          treatment_type:    d.treatment_type    || '',
          bio:               d.bio               || '',
        });
        // Default schedule clinic to first clinic if not set
        if (d.clinics?.length > 0 && !schedule.clinic_id) {
          setSchedule((s) => ({ ...s, clinic_id: s.clinic_id || d.clinics[0].id }));
        }
      })
      .catch(console.error);
  };

  useEffect(() => { load(); }, []);

  const notify = (ok, txt) => {
    if (ok) setMsg(txt); else setError(txt);
    setTimeout(() => { setMsg(''); setError(''); }, 4000);
  };

  const saveProfile = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.put('/doctors/profile', form);
      notify(true, 'Profile saved successfully.');
      load();
    } catch (err) { notify(false, err.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const addDisease = async () => {
    if (!disease.trim()) return;
    try { await api.post('/doctors/diseases', { disease_name: disease }); setDisease(''); load(); }
    catch (err) { notify(false, err.response?.data?.message || 'Failed.'); }
  };

  const removeDisease = async (id) => {
    try { await api.delete(`/doctors/diseases/${id}`); load(); }
    catch (err) { notify(false, err.response?.data?.message || 'Failed.'); }
  };

  const addClinic = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/doctors/clinics', clinic);
      setClinic(EMPTY_CLINIC);
      notify(true, 'Clinic added.');
      load();
    } catch (err) { notify(false, err.response?.data?.message || 'Failed.'); }
    finally { setSaving(false); }
  };

  const addSchedule = async (e) => {
    e.preventDefault();
    if (!schedule.clinic_id) return notify(false, 'Please select a clinic.');
    setSaving(true);
    try {
      await api.post('/doctors/schedules', schedule);
      notify(true, 'Schedule added.');
      load();
    } catch (err) { notify(false, err.response?.data?.message || 'Failed.'); }
    finally { setSaving(false); }
  };

  const toggleSchedule = async (id) => {
    try { await api.patch(`/doctors/schedules/${id}/toggle`); load(); }
    catch (err) { notify(false, err.response?.data?.message || 'Failed.'); }
  };

  const deleteClinic = async (id) => {
    if (!confirm('Remove this clinic from your profile?')) return;
    try { await api.delete(`/doctors/clinics/${id}`); load(); notify(true, 'Clinic removed.'); }
    catch (err) { notify(false, err.response?.data?.message || 'Failed.'); }
  };

  const deleteSchedule = async (id) => {
    if (!confirm('Delete this schedule?')) return;
    try { await api.delete(`/doctors/schedules/${id}`); load(); notify(true, 'Schedule deleted.'); }
    catch (err) { notify(false, err.response?.data?.message || 'Failed.'); }
  };

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (!profile) return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <svg className="animate-spin w-8 h-8 text-blue-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p className="text-slate-400 text-sm">Loading profile…</p>
      </div>
    </div>
  );

  const TABS = [
    { key: 'profile',   label: 'Profile',   icon: UserIcon      },
    { key: 'clinics',   label: 'Clinics',   icon: BuildingIcon  },
    { key: 'schedules', label: 'Schedules', icon: CalendarIcon  },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-header">My Profile</h1>
          <p className="page-subtitle">Manage your professional details, clinics, and schedule</p>
        </div>
        <span className={`badge ${profile.is_verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-600'} gap-1`}>
          {profile.is_verified
            ? <><BadgeCheckIcon className="w-3.5 h-3.5" /> Verified</>
            : <><ShieldIcon className="w-3.5 h-3.5" /> Pending Verification</>}
        </span>
      </div>

      {/* Alerts */}
      {msg   && <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2"><CheckIcon className="w-4 h-4" />{msg}</div>}
      {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {/* Setup warning */}
      {profile.clinics?.length === 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
          <BuildingIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Patients can't book yet</p>
            <p className="text-xs text-amber-700 mt-0.5">Add at least one clinic and a schedule so patients can book appointments with you.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="card p-1.5 flex gap-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              activeTab === key ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}>
            <Icon className="w-4 h-4" />
            {label}
            {key === 'clinics' && profile.clinics?.length > 0 && (
              <span className={`text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold ${activeTab === key ? 'bg-white/20' : 'bg-blue-100 text-blue-700'}`}>
                {profile.clinics.length}
              </span>
            )}
            {key === 'schedules' && profile.schedules?.length > 0 && (
              <span className={`text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold ${activeTab === key ? 'bg-white/20' : 'bg-blue-100 text-blue-700'}`}>
                {profile.schedules.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ──────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="space-y-5">
          <form onSubmit={saveProfile} className="card p-6 space-y-5">
            <p className="text-sm font-semibold text-slate-700">Professional Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Specialization</label>
                <input type="text" value={form.specialization} onChange={f('specialization')}
                  className="input" placeholder="e.g. Cardiologist" />
              </div>
              <div>
                <label className="label">Qualification</label>
                <input type="text" value={form.qualification} onChange={f('qualification')}
                  className="input" placeholder="MBBS, FCPS…" />
              </div>
              <div>
                <label className="label">Experience (years)</label>
                <input type="number" min={0} value={form.experience_years} onChange={f('experience_years')}
                  className="input" placeholder="5" />
              </div>
              <div>
                <label className="label">Consultation Fee (Rs.)</label>
                <input type="number" min={0} value={form.consultation_fee} onChange={f('consultation_fee')}
                  className="input" placeholder="500" />
              </div>
              <div className="col-span-full">
                <label className="label">Treatment Type</label>
                <select value={form.treatment_type} onChange={f('treatment_type')} className="input">
                  <option value="">Select…</option>
                  {['allopathic','homeopathic','herbal'].map((t) => (
                    <option key={t} value={t} className="capitalize">{t}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-full">
                <label className="label">Bio <span className="text-slate-400 font-normal">(optional)</span></label>
                <textarea rows={3} value={form.bio} onChange={f('bio')}
                  className="input resize-none" placeholder="Brief professional summary…" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : <><CheckIcon className="w-4 h-4" /> Save Profile</>}
            </button>
          </form>

          {/* Diseases */}
          <div className="card p-5">
            <p className="text-sm font-semibold text-slate-700 mb-3">Conditions Treated</p>
            {profile.diseases?.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-3">
                {profile.diseases.map((d) => (
                  <span key={d.id || d} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {d.disease_name || d}
                    <button onClick={() => removeDisease(d.id)} className="text-blue-400 hover:text-red-500 transition-colors">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 mb-3">No conditions added yet</p>
            )}
            <div className="flex gap-2">
              <input type="text" value={disease} onChange={(e) => setDisease(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDisease())}
                className="input flex-1" placeholder="Add condition (e.g. Diabetes)…" />
              <button type="button" onClick={addDisease} className="btn-primary px-4">
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CLINICS TAB ──────────────────────────────── */}
      {activeTab === 'clinics' && (
        <div className="space-y-4">
          {/* Existing clinics */}
          {profile.clinics?.length > 0 ? (
            <div className="space-y-3">
              {profile.clinics.map((c) => (
                <div key={c.id} className="card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BuildingIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{c.name}</p>
                    <p className="text-sm text-slate-500">{c.address}{c.city ? ` · ${c.city}` : ''}</p>
                    {c.phone && <p className="text-xs text-slate-400">{c.phone}</p>}
                  </div>
                  <button onClick={() => deleteClinic(c.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                    title="Remove clinic">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-10 flex flex-col items-center text-center">
              <BuildingIcon className="w-12 h-12 text-slate-200 mb-3" />
              <p className="text-slate-500 font-medium">No clinics yet</p>
              <p className="text-slate-400 text-sm mt-1">Add your first clinic below</p>
            </div>
          )}

          {/* Add clinic form */}
          <form onSubmit={addClinic} className="card p-5 space-y-4">
            <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <PlusIcon className="w-4 h-4 text-blue-600" /> Add New Clinic
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="col-span-full">
                <label className="label">Clinic Name <span className="text-red-400">*</span></label>
                <input type="text" required value={clinic.name} onChange={(e) => setClinic({ ...clinic, name: e.target.value })}
                  className="input" placeholder="e.g. City Medical Centre" />
              </div>
              <div className="col-span-full">
                <label className="label">Address <span className="text-red-400">*</span></label>
                <input type="text" required value={clinic.address} onChange={(e) => setClinic({ ...clinic, address: e.target.value })}
                  className="input" placeholder="Street / Area" />
              </div>
              <div>
                <label className="label">City</label>
                <input type="text" value={clinic.city} onChange={(e) => setClinic({ ...clinic, city: e.target.value })}
                  className="input" placeholder="Karachi" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input type="text" value={clinic.phone} onChange={(e) => setClinic({ ...clinic, phone: e.target.value })}
                  className="input" placeholder="021-XXXXXXX" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              <PlusIcon className="w-4 h-4" /> Add Clinic
            </button>
          </form>
        </div>
      )}

      {/* ── SCHEDULES TAB ──────────────────────────────── */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          {profile.clinics?.length === 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
              You need to add a clinic first before adding schedules.
              <button onClick={() => setActiveTab('clinics')} className="ml-2 font-semibold underline">Add Clinic →</button>
            </div>
          )}

          {/* Existing schedules */}
          {profile.schedules?.length > 0 ? (
            <div className="space-y-2">
              {[...profile.schedules]
                .sort((a,b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day))
                .map((s) => (
                <div key={s.id} className={`card p-4 flex items-center gap-4 ${!s.is_available ? 'opacity-60' : ''}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    s.is_available ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {DAY_SHORT[s.day]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 capitalize">{s.day}</p>
                    <p className="text-sm text-slate-500">
                      {s.start_time?.slice(0,5)} – {s.end_time?.slice(0,5)}
                      <span className="mx-2 text-slate-300">·</span>
                      {s.slot_duration_mins} min slots
                      {s.clinic_name && <><span className="mx-2 text-slate-300">·</span>{s.clinic_name}</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => toggleSchedule(s.id)}
                      className={`btn-ghost text-xs py-1.5 px-3 ${s.is_available ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                      {s.is_available ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => deleteSchedule(s.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete schedule">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-10 flex flex-col items-center text-center">
              <CalendarIcon className="w-12 h-12 text-slate-200 mb-3" />
              <p className="text-slate-500 font-medium">No schedules yet</p>
              <p className="text-slate-400 text-sm mt-1">Add a schedule so patients can see available slots</p>
            </div>
          )}

          {/* Add schedule form */}
          <form onSubmit={addSchedule} className="card p-5 space-y-4">
            <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <PlusIcon className="w-4 h-4 text-blue-600" /> Add Schedule
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="col-span-full">
                <label className="label">Clinic <span className="text-red-400">*</span></label>
                <select required value={schedule.clinic_id}
                  onChange={(e) => setSchedule({ ...schedule, clinic_id: e.target.value })}
                  className="input">
                  <option value="">Select clinic…</option>
                  {(profile.clinics || []).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}{c.city ? ` (${c.city})` : ''}</option>
                  ))}
                </select>
                {profile.clinics?.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No clinics — add one first.</p>
                )}
              </div>
              <div>
                <label className="label">Day</label>
                <select value={schedule.day} onChange={(e) => setSchedule({ ...schedule, day: e.target.value })} className="input capitalize">
                  {DAYS.map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Slot Duration (min)</label>
                <select value={schedule.slot_duration_mins}
                  onChange={(e) => setSchedule({ ...schedule, slot_duration_mins: Number(e.target.value) })}
                  className="input">
                  {[10,15,20,30,45,60].map((m) => <option key={m} value={m}>{m} min</option>)}
                </select>
              </div>
              <div>
                <label className="label">Start Time</label>
                <input type="time" value={schedule.start_time}
                  onChange={(e) => setSchedule({ ...schedule, start_time: e.target.value })}
                  className="input" />
              </div>
              <div>
                <label className="label">End Time</label>
                <input type="time" value={schedule.end_time}
                  onChange={(e) => setSchedule({ ...schedule, end_time: e.target.value })}
                  className="input" />
              </div>
            </div>
            <button type="submit" disabled={saving || profile.clinics?.length === 0} className="btn-primary disabled:opacity-50">
              <PlusIcon className="w-4 h-4" /> Add Schedule
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
