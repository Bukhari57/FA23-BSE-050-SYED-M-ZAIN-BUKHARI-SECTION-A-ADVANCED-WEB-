import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { CreditCardIcon, CheckIcon, ClockIcon, ArrowLeftIcon, UserIcon, BadgeCheckIcon } from '../../components/Icons';

export default function AssistantDashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ pending: 0, verified: 0, rejected: 0 });
  const [recent, setRecent] = useState([]);
  const [assignedDoctor, setAssignedDoctor] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/payments', { params: { status: 'pending', limit: 50 } }),
      api.get('/payments', { params: { limit: 5 } }),
    ]).then(([pending, all]) => {
      const allPayments = all.data?.data?.payments || [];
      setCounts({
        pending:  allPayments.filter((p) => p.payment_status === 'pending').length,
        verified: allPayments.filter((p) => p.payment_status === 'verified').length,
        rejected: allPayments.filter((p) => p.payment_status === 'rejected').length,
      });
      setCounts((c) => ({ ...c, pending: pending.data?.data?.pagination?.total || 0 }));
      setRecent(allPayments.slice(0, 5));
      // Extract assigned doctor from payments data
      if (allPayments.length > 0) {
        setAssignedDoctor({ name: allPayments[0].doctor_name });
      }
    }).catch(console.error);

    // Also try to get doctor info from appointments
    api.get('/appointments', { params: { limit: 1 } }).then(({ data }) => {
      const appts = data?.data?.appointments || [];
      if (appts.length > 0 && !assignedDoctor) {
        setAssignedDoctor({ name: appts[0].doctor_name, specialization: appts[0].specialization });
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Welcome, {user?.name}</h1>
        <p className="page-subtitle">Payment verification dashboard</p>
      </div>

      {/* Assigned doctor */}
      {assignedDoctor && (
        <div className="card p-4 flex items-center gap-4 border border-emerald-100 bg-emerald-50/30">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <BadgeCheckIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Assigned Doctor</p>
            <p className="text-sm font-semibold text-slate-900 mt-0.5">Dr. {assignedDoctor.name}</p>
            {assignedDoctor.specialization && (
              <p className="text-xs text-slate-500">{assignedDoctor.specialization}</p>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card bg-gradient-to-br from-amber-400 to-orange-600">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-white/80">Awaiting Verification</p>
              <p className="text-4xl font-bold text-white mt-1">{counts.pending}</p>
            </div>
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card bg-gradient-to-br from-emerald-500 to-emerald-700">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-white/80">Verified Today</p>
              <p className="text-4xl font-bold text-white mt-1">{counts.verified}</p>
            </div>
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center">
              <CheckIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-700">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-white/80">Total Payments</p>
              <p className="text-4xl font-bold text-white mt-1">{counts.pending + counts.verified + counts.rejected}</p>
            </div>
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center">
              <CreditCardIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      {counts.pending > 0 && (
        <div className="card border-2 border-amber-100 bg-amber-50/30 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <ClockIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                {counts.pending} payment{counts.pending > 1 ? 's' : ''} awaiting your review
              </p>
              <p className="text-sm text-slate-500">Verify or reject uploaded payment screenshots</p>
            </div>
          </div>
          <Link to="/assistant/payments"
            className="btn-primary whitespace-nowrap flex-shrink-0">
            Review Now
          </Link>
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Quick Actions</h3>
        </div>
        <Link to="/assistant/payments"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors group">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <CreditCardIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">Verify Payments</p>
            <p className="text-xs text-slate-400">Review payment screenshots from patients</p>
          </div>
          <ArrowLeftIcon className="w-4 h-4 text-slate-300 ml-auto rotate-180 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
