import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  CreditCardIcon, CheckIcon, XIcon, EyeIcon, ClockIcon,
  UserIcon, BuildingIcon, CalendarIcon, CurrencyIcon, ShieldIcon,
  RefreshIcon, InfoIcon,
} from '../../components/Icons';

const BASE = 'http://localhost:5001';

const STATUSES = ['pending', 'verified', 'rejected'];

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    tone: 'amber',
    icon: ClockIcon,
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    active: 'bg-amber-500 text-white shadow-sm shadow-amber-500/20',
    ring: 'ring-amber-200',
  },
  verified: {
    label: 'Verified',
    tone: 'emerald',
    icon: CheckIcon,
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    active: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20',
    ring: 'ring-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    tone: 'rose',
    icon: XIcon,
    badge: 'bg-rose-100 text-rose-700 border-rose-200',
    active: 'bg-rose-500 text-white shadow-sm shadow-rose-500/20',
    ring: 'ring-rose-200',
  },
};

const formatDate = (value) => {
  if (!value) return 'Unscheduled';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (value) => value?.slice(0, 5) || '--:--';

const formatAmount = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

export default function Payments() {
  const { user: me } = useAuth();
  const [payments, setPayments] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, verified: 0, rejected: 0 });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [rejectId, setRejectId] = useState(null);
  const [rejNote, setRejNote] = useState('');
  const [actioning, setActioning] = useState(null);
  const [preview, setPreview] = useState(null);

  const isAdmin = ['admin', 'super_admin'].includes(me?.role);

  const load = async () => {
    setLoading(true);
    try {
      const [current, pending, verified, rejected] = await Promise.all([
        api.get('/payments', { params: { status: filter, limit: 50 } }),
        api.get('/payments', { params: { status: 'pending', limit: 1 } }),
        api.get('/payments', { params: { status: 'verified', limit: 1 } }),
        api.get('/payments', { params: { status: 'rejected', limit: 1 } }),
      ]);

      setPayments(current.data?.data?.payments || []);
      setCounts({
        pending: pending.data?.data?.pagination?.total || 0,
        verified: verified.data?.data?.pagination?.total || 0,
        rejected: rejected.data?.data?.pagination?.total || 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const selectedPayment = useMemo(
    () => payments.find((p) => p.id === preview?.id) || preview?.payment || null,
    [payments, preview]
  );

  const handleVerify = async (id) => {
    if (!window.confirm('Verify this payment and confirm the appointment?')) return;
    setActioning(`${id}_verify`);
    try {
      await api.patch(`/payments/${id}/verify`);
      await load();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Verification failed.');
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    setActioning(`${rejectId}_reject`);
    try {
      await api.patch(`/payments/${rejectId}/reject`, { rejection_note: rejNote });
      setRejectId(null);
      setRejNote('');
      await load();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Rejection failed.');
    } finally {
      setActioning(null);
    }
  };

  const screenshotUrl = (path) => path ? `${BASE}/${path}` : null;

  const openPreview = (payment) => {
    const url = screenshotUrl(payment.screenshot_path);
    if (url) setPreview({ id: payment.id, url, payment });
  };

  const activeConfig = STATUS_CONFIG[filter];
  const ActiveIcon = activeConfig.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-xl shadow-slate-900/10">
        <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100">
              {isAdmin ? <ShieldIcon className="h-3.5 w-3.5" /> : <CreditCardIcon className="h-3.5 w-3.5" />}
              {isAdmin ? 'Admin payment control' : 'Assistant payment queue'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-normal">Payment Verification</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {isAdmin
                ? 'Review payment uploads across every doctor, clinic, and appointment.'
                : 'Review payment uploads for doctors assigned to your assistant account.'}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:w-[420px]">
            {STATUSES.map((status) => {
              const Icon = STATUS_CONFIG[status].icon;
              return (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`rounded-xl border px-4 py-3 text-left transition-all ${
                    filter === status
                      ? 'border-white/30 bg-white text-slate-950'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <Icon className="mb-2 h-4 w-4" />
                  <span className="block text-2xl font-bold leading-none">{counts[status]}</span>
                  <span className="mt-1 block text-[11px] font-semibold uppercase tracking-wide">{STATUS_CONFIG[status].label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="card flex w-fit gap-1 p-1.5">
          {STATUSES.map((status) => {
            const sc = STATUS_CONFIG[status];
            const Icon = sc.icon;
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold capitalize transition-all ${
                  filter === status ? sc.active : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {status}
              </button>
            );
          })}
        </div>
        <button onClick={load} disabled={loading} className="btn-secondary w-fit">
          <RefreshIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <ActiveIcon className="h-4 w-4" />
            {activeConfig.label} payments
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{counts[filter]}</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/80 ring-1 ring-slate-100" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="card flex min-h-[320px] flex-col items-center justify-center p-10 text-center">
              <CreditCardIcon className="mb-4 h-14 w-14 text-slate-200" />
              <p className="font-semibold text-slate-700">No {filter} payments</p>
              <p className="mt-1 max-w-sm text-sm text-slate-400">
                {filter === 'pending'
                  ? 'There are no payment uploads waiting for review in this queue.'
                  : `No ${filter} payment records match this view yet.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => {
                const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
                const imgUrl = screenshotUrl(p.screenshot_path);
                return (
                  <article key={p.id} className={`card overflow-hidden ring-1 ring-transparent transition-all hover:ring-slate-200 ${selectedPayment?.id === p.id ? sc.ring : ''}`}>
                    <div className="flex flex-col gap-5 p-5 lg:flex-row">
                      <button
                        type="button"
                        onClick={() => openPreview(p)}
                        disabled={!imgUrl}
                        className={`group relative h-32 w-full shrink-0 overflow-hidden rounded-xl border bg-slate-50 lg:w-28 ${
                          imgUrl ? 'border-slate-200 cursor-pointer' : 'border-slate-100 cursor-default'
                        }`}
                        title={imgUrl ? 'Preview payment screenshot' : 'No screenshot uploaded'}
                      >
                        {imgUrl ? (
                          <>
                            <img src={imgUrl} alt="Payment receipt thumbnail" className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
                            <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-white opacity-0 transition-all group-hover:bg-slate-950/40 group-hover:opacity-100">
                              <EyeIcon className="h-6 w-6" />
                            </span>
                          </>
                        ) : (
                          <CreditCardIcon className="m-auto h-full w-8 text-slate-300" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="truncate text-lg font-bold text-slate-950">{p.patient_name}</h2>
                              <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${sc.badge}`}>
                                {sc.label}
                              </span>
                            </div>
                            <div className="mt-3 grid gap-2 text-sm text-slate-500 md:grid-cols-2">
                              <span className="flex min-w-0 items-center gap-2">
                                <UserIcon className="h-4 w-4 shrink-0 text-slate-400" />
                                <span className="truncate">Dr. {p.doctor_name}</span>
                              </span>
                              <span className="flex min-w-0 items-center gap-2">
                                <BuildingIcon className="h-4 w-4 shrink-0 text-slate-400" />
                                <span className="truncate">{p.clinic_name}</span>
                              </span>
                              <span className="flex min-w-0 items-center gap-2">
                                <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
                                <span className="truncate">{formatDate(p.appointment_date)} at {formatTime(p.appointment_time)}</span>
                              </span>
                              <span className="flex min-w-0 items-center gap-2">
                                <CurrencyIcon className="h-4 w-4 shrink-0 text-slate-400" />
                                <span className="truncate">{formatAmount(p.amount)}</span>
                              </span>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-2xl font-black text-slate-950">{formatAmount(p.amount)}</p>
                            {imgUrl && (
                              <button onClick={() => openPreview(p)} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                                <EyeIcon className="h-3.5 w-3.5" />
                                Preview receipt
                              </button>
                            )}
                          </div>
                        </div>

                        {(p.rejection_note || p.verified_by_name) && (
                          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                            {p.rejection_note && <span className="text-rose-600">Rejected: {p.rejection_note}</span>}
                            {p.verified_by_name && p.status === 'verified' && <span className="text-emerald-700">Verified by {p.verified_by_name}</span>}
                          </div>
                        )}

                        {p.status === 'pending' && (
                          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                            <button
                              onClick={() => handleVerify(p.id)}
                              disabled={actioning === `${p.id}_verify`}
                              className="btn-primary"
                            >
                              {actioning === `${p.id}_verify`
                                ? 'Verifying...'
                                : <><CheckIcon className="h-4 w-4" /> Verify & Confirm</>}
                            </button>
                            <button
                              onClick={() => { setRejectId(p.id); setRejNote(''); }}
                              className="btn-danger"
                            >
                              <XIcon className="h-4 w-4" /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="hidden xl:block">
          <div className="sticky top-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {selectedPayment ? (
              <>
                <div className="border-b border-slate-100 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Receipt preview</p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-900">{selectedPayment.patient_name}</p>
                </div>
                <button type="button" onClick={() => openPreview(selectedPayment)} className="block h-[460px] w-full bg-slate-50">
                  <img src={screenshotUrl(selectedPayment.screenshot_path)} alt="Payment receipt preview" className="h-full w-full object-contain" />
                </button>
                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 p-4 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Amount</p>
                    <p className="font-bold text-slate-950">{formatAmount(selectedPayment.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Status</p>
                    <p className="font-bold capitalize text-slate-950">{selectedPayment.status}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-slate-400">Doctor</p>
                    <p className="truncate font-bold text-slate-950">Dr. {selectedPayment.doctor_name}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-[560px] flex-col items-center justify-center p-8 text-center">
                <InfoIcon className="mb-3 h-10 w-10 text-slate-300" />
                <p className="font-semibold text-slate-700">Select a receipt</p>
                <p className="mt-1 text-sm text-slate-400">Open a payment screenshot to inspect the upload before verifying it.</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" onClick={() => setPreview(null)}>
          <div className="relative grid max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl sm:grid-cols-[minmax(0,1fr)_320px]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreview(null)} className="absolute right-4 top-4 z-10 rounded-full bg-slate-950/80 p-2 text-white hover:bg-slate-950">
              <XIcon className="h-5 w-5" />
            </button>
            <div className="flex min-h-[420px] items-center justify-center bg-slate-100 p-4 lg:min-h-[680px]">
              <img src={preview.url} alt="Payment screenshot" className="max-h-[84vh] w-full object-contain" />
            </div>
            {selectedPayment && (
              <div className="space-y-5 overflow-y-auto border-t border-slate-100 p-6 lg:border-l lg:border-t-0">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Receipt details</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-950">{selectedPayment.patient_name}</h3>
                </div>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="font-semibold text-slate-400">Amount</dt>
                    <dd className="text-lg font-black text-slate-950">{formatAmount(selectedPayment.amount)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-400">Doctor</dt>
                    <dd className="font-semibold text-slate-800">Dr. {selectedPayment.doctor_name}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-400">Clinic</dt>
                    <dd className="font-semibold text-slate-800">{selectedPayment.clinic_name}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-400">Appointment</dt>
                    <dd className="font-semibold text-slate-800">{formatDate(selectedPayment.appointment_date)} at {formatTime(selectedPayment.appointment_time)}</dd>
                  </div>
                </dl>
                {selectedPayment.status === 'pending' && (
                  <div className="flex flex-col gap-2 border-t border-slate-100 pt-5">
                    <button onClick={() => handleVerify(selectedPayment.id)} disabled={actioning === `${selectedPayment.id}_verify`} className="btn-primary">
                      <CheckIcon className="h-4 w-4" />
                      Verify & Confirm
                    </button>
                    <button onClick={() => { setRejectId(selectedPayment.id); setRejNote(''); }} className="btn-danger justify-center">
                      <XIcon className="h-4 w-4" />
                      Reject Payment
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-slide-up">
            <h3 className="text-lg font-bold text-slate-950">Reject Payment</h3>
            <p className="mt-1 text-sm text-slate-500">Add a short note so the patient knows what to correct.</p>
            <textarea
              rows={4}
              value={rejNote}
              onChange={(e) => setRejNote(e.target.value)}
              className="input mt-4 resize-none"
              placeholder="Example: screenshot is blurry, amount is incorrect, or receipt is invalid."
            />
            <div className="mt-5 flex gap-3">
              <button onClick={() => { setRejectId(null); setRejNote(''); }} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={handleReject} disabled={actioning?.endsWith('_reject')} className="btn-danger flex-1 justify-center">
                {actioning?.endsWith('_reject') ? 'Rejecting...' : <><XIcon className="h-4 w-4" /> Reject</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
