import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  UserIcon, BuildingIcon, CalendarIcon, ClockIcon,
  CheckIcon, BadgeCheckIcon, CurrencyIcon, ArrowLeftIcon,
} from '../../components/Icons';

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate     = useNavigate();

  const [doctor, setDoctor]   = useState(null);
  const [slots, setSlots]     = useState([]);
  const [slotsMsg, setSlotsMsg] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm]       = useState({ clinic_id: '', appointment_date: '', appointment_time: '', patient_notes: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [doctorLoading, setDoctorLoading] = useState(true);

  useEffect(() => {
    setDoctorLoading(true);
    api.get(`/doctors/${doctorId}`)
      .then(({ data }) => {
        setDoctor(data.data);
        // Auto-select clinic if only one
        if (data.data.clinics?.length === 1) {
          setForm((f) => ({ ...f, clinic_id: data.data.clinics[0].id }));
        }
      })
      .catch(() => setError('Could not load doctor details.'))
      .finally(() => setDoctorLoading(false));
  }, [doctorId]);

  useEffect(() => {
    if (!form.appointment_date || !form.clinic_id) { setSlots([]); setSlotsMsg(''); return; }
    setLoadingSlots(true);
    setSlotsMsg('');
    api.get(`/doctors/${doctorId}/slots`, {
      params: { date: form.appointment_date, clinic_id: form.clinic_id },
    })
      .then(({ data }) => {
        const s = data.data.slots || [];
        setSlots(s);
        if (s.length === 0) setSlotsMsg('No slots available for this date. Try another day.');
      })
      .catch(() => setSlotsMsg('Could not load slots.'))
      .finally(() => setLoadingSlots(false));
  }, [form.appointment_date, form.clinic_id, doctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clinic_id)        return setError('Please select a clinic.');
    if (!form.appointment_date) return setError('Please pick a date.');
    if (!form.appointment_time) return setError('Please select a time slot.');
    setError('');
    setLoading(true);
    try {
      await api.post('/appointments', { doctor_id: doctorId, ...form });
      setSuccess('Appointment booked! Redirecting to My Appointments…');
      setTimeout(() => navigate('/patient/appointments'), 2200);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (doctorLoading) return (
    <div className="flex items-center justify-center py-24">
      <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  );

  if (!doctor) return (
    <div className="card p-12 text-center">
      <p className="text-slate-500">Doctor not found.</p>
      <button onClick={() => navigate('/patient/doctors')} className="btn-primary mt-4">
        <ArrowLeftIcon className="w-4 h-4" /> Back to Search
      </button>
    </div>
  );

  const availableSlots   = slots.filter((s) => s.is_available);
  const unavailableSlots = slots.filter((s) => !s.is_available);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="btn-ghost gap-2 -ml-1 text-slate-500">
        <ArrowLeftIcon className="w-4 h-4" /> Back
      </button>

      {/* Doctor card */}
      <div className="card p-5 flex items-center gap-5">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center flex-shrink-0">
          <UserIcon className="w-8 h-8 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-bold text-slate-900 text-lg">Dr. {doctor.name}</h2>
            <BadgeCheckIcon className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-blue-600 font-medium text-sm">{doctor.specialization}</p>
          <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
            {doctor.experience_years > 0 && <span>{doctor.experience_years} yrs experience</span>}
            {doctor.qualification && <span>{doctor.qualification}</span>}
            <span className="capitalize">{doctor.treatment_type}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-slate-400">Consultation Fee</p>
          <p className="text-2xl font-bold text-slate-900">Rs. {doctor.consultation_fee}</p>
        </div>
      </div>

      {/* No clinics warning */}
      {(!doctor.clinics || doctor.clinics.length === 0) && (
        <div className="card p-8 text-center">
          <BuildingIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="font-semibold text-slate-700">No clinics available</p>
          <p className="text-sm text-slate-400 mt-1">This doctor hasn't added a clinic yet. Please check back later or choose another doctor.</p>
          <button onClick={() => navigate('/patient/doctors')} className="btn-primary mt-4">
            Find Another Doctor
          </button>
        </div>
      )}

      {/* Booking form */}
      {doctor.clinics?.length > 0 && (
        <>
          {error   && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
          {success && <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2"><CheckIcon className="w-4 h-4" />{success}</div>}

          <form onSubmit={handleSubmit} className="card p-6 space-y-5">
            <h3 className="font-semibold text-slate-900">Book Appointment</h3>

            {/* Clinic */}
            <div>
              <label className="label">Select Clinic</label>
              {doctor.clinics.length === 1 ? (
                <div className="input bg-slate-50 flex items-center gap-3 cursor-default">
                  <BuildingIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{doctor.clinics[0].name}{doctor.clinics[0].city ? ` — ${doctor.clinics[0].city}` : ''}</span>
                </div>
              ) : (
                <select value={form.clinic_id}
                  onChange={(e) => setForm({ ...form, clinic_id: e.target.value, appointment_time: '' })}
                  className="input" required>
                  <option value="">Choose clinic…</option>
                  {doctor.clinics.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}{c.city ? ` — ${c.city}` : ''}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="label">Appointment Date</label>
              <input type="date" required min={today}
                value={form.appointment_date}
                onChange={(e) => setForm({ ...form, appointment_date: e.target.value, appointment_time: '' })}
                className="input" />
            </div>

            {/* Slots */}
            {form.appointment_date && form.clinic_id && (
              <div>
                <label className="label flex items-center gap-2">
                  Available Time Slots
                  {loadingSlots && (
                    <svg className="animate-spin w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  )}
                </label>

                {slotsMsg && !loadingSlots && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                    {slotsMsg}
                  </div>
                )}

                {!loadingSlots && slots.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {availableSlots.map((s) => (
                      <button key={s.time} type="button"
                        onClick={() => setForm({ ...form, appointment_time: s.time })}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                          form.appointment_time === s.time
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                        }`}>
                        {s.time}
                      </button>
                    ))}
                    {unavailableSlots.map((s) => (
                      <button key={s.time} type="button" disabled
                        className="px-4 py-2 rounded-xl text-sm font-medium border-2 bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed line-through">
                        {s.time}
                      </button>
                    ))}
                  </div>
                )}

                {!loadingSlots && availableSlots.length === 0 && slots.length > 0 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-700">
                    All slots are booked for this date. Please choose another day.
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="label">Notes <span className="text-slate-400 font-normal">(optional)</span></label>
              <textarea rows={3} value={form.patient_notes}
                onChange={(e) => setForm({ ...form, patient_notes: e.target.value })}
                className="input resize-none"
                placeholder="Describe your symptoms or concerns…" />
            </div>

            {/* Fee notice */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
              <CurrencyIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="text-sm">
                <span className="text-blue-700">Consultation Fee: </span>
                <span className="font-bold text-blue-900">Rs. {doctor.consultation_fee}</span>
                <span className="text-blue-600 ml-2">— upload payment proof after booking</span>
              </div>
            </div>

            <button type="submit"
              disabled={loading || !form.appointment_time}
              className="btn-primary w-full justify-center py-3 text-base disabled:opacity-50">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Booking…
                </span>
              ) : (
                <><CheckIcon className="w-5 h-5" /> Confirm Booking</>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
