import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axios';
import {
  UsersIcon, UserIcon, ChartBarIcon, CreditCardIcon,
  CalendarIcon, BadgeCheckIcon, BuildingIcon, ClipboardIcon,
  ArrowLeftIcon, RefreshIcon,
} from '../../components/Icons';

const StatCard = ({ label, value, icon: Icon, gradient, sub }) => (
  <div className={`stat-card ${gradient}`}>
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-sm font-medium text-white/80">{label}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        {sub && <p className="text-xs text-white/60 mt-1">{sub}</p>}
      </div>
      <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
);

const APPT_COLORS = {
  pending: '#f59e0b', confirmed: '#10b981', completed: '#6366f1', cancelled: '#ef4444',
};
const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const { dark } = useTheme();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/stats')
      .then(({ data }) => setStats(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p className="text-slate-500 text-sm">Loading analytics…</p>
      </div>
    </div>
  );

  if (!stats) return null;

  const paymentPieData = [
    { name: 'Verified',  value: parseInt(stats.payments.verified)  },
    { name: 'Pending',   value: parseInt(stats.payments.pending)   },
    { name: 'Rejected',  value: parseInt(stats.payments.rejected)  },
  ].filter((d) => d.value > 0);

  const apptBarData = [
    { name: 'Pending',   value: parseInt(stats.appointments.pending)   },
    { name: 'Confirmed', value: parseInt(stats.appointments.confirmed) },
    { name: 'Completed', value: parseInt(stats.appointments.completed) },
    { name: 'Cancelled', value: parseInt(stats.appointments.cancelled) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-header">Admin Dashboard</h1>
          <p className="page-subtitle">Platform overview and analytics</p>
        </div>
        <button onClick={load} className="btn-secondary gap-2 flex-shrink-0">
          <RefreshIcon className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stat Cards Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"    value={stats.users.total_users}
          icon={UsersIcon}       gradient="bg-gradient-to-br from-blue-500 to-blue-700"
          sub={`${stats.users.inactive_users} inactive`} />
        <StatCard
          label="Total Patients" value={stats.users.patients}
          icon={UserIcon}        gradient="bg-gradient-to-br from-violet-500 to-purple-700" />
        <StatCard
          label="Total Doctors"  value={stats.doctors.total}
          icon={BadgeCheckIcon}  gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
          sub={`${stats.doctors.pending_verification} awaiting verification`} />
        <StatCard
          label="Total Revenue"  value={`Rs. ${Number(stats.payments.total_revenue).toLocaleString()}`}
          icon={CreditCardIcon}  gradient="bg-gradient-to-br from-amber-400 to-orange-600" />
      </div>

      {/* Stat Cards Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Appointments"   value={stats.appointments.total}
          icon={CalendarIcon}    gradient="bg-gradient-to-br from-cyan-500 to-blue-600" />
        <StatCard
          label="Confirmed Appts" value={stats.appointments.confirmed}
          icon={ChartBarIcon}    gradient="bg-gradient-to-br from-teal-500 to-teal-700" />
        <StatCard
          label="Clinics"        value={stats.clinics.total}
          icon={BuildingIcon}    gradient="bg-gradient-to-br from-rose-500 to-pink-700" />
        <StatCard
          label="Medical Records" value={stats.medical_history.total}
          icon={ClipboardIcon}   gradient="bg-gradient-to-br from-slate-500 to-slate-700" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Monthly Appointments & Revenue</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">Last 6 months overview</p>
          {stats.monthly_stats?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.monthly_stats} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradAppts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, backgroundColor: dark ? '#1e293b' : '#fff', color: dark ? '#e2e8f0' : '#0f172a', fontSize: 12 }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="appointments" name="Appointments" stroke="#2563eb" strokeWidth={2} fill="url(#gradAppts)" dot={{ r: 3, fill: '#2563eb' }} />
                <Area type="monotone" dataKey="revenue" name="Revenue (Rs.)" stroke="#10b981" strokeWidth={2} fill="url(#gradRevenue)" dot={{ r: 3, fill: '#10b981' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-56 text-slate-400 text-sm">
              No data yet for the last 6 months
            </div>
          )}
        </div>

        {/* Payment Status Pie */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Payment Status</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">All time breakdown</p>
          {paymentPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={paymentPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={4} dataKey="value">
                  {paymentPieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, backgroundColor: dark ? '#1e293b' : '#fff', color: dark ? '#e2e8f0' : '#0f172a', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: dark ? '#94a3b8' : '#475569' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-56 text-slate-400 text-sm">No payments yet</div>
          )}
        </div>
      </div>

      {/* Appointment Bar + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointment breakdown bar */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Appointment Status Breakdown</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">Current status of all appointments</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={apptBarData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#334155' : '#f1f5f9'} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, backgroundColor: dark ? '#1e293b' : '#fff', color: dark ? '#e2e8f0' : '#0f172a', fontSize: 12 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {apptBarData.map((entry, i) => (
                  <Cell key={i} fill={Object.values(APPT_COLORS)[i] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { to: '/admin/users',   label: 'Manage Users',        icon: UsersIcon,      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
              { to: '/admin/doctors', label: 'Verify Doctors',      icon: BadgeCheckIcon, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' },
              { to: '/admin/clinics', label: 'View Clinics',        icon: BuildingIcon,   color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30' },
            ].map((l) => (
              <Link key={l.to} to={l.to}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${l.color}`}>
                  <l.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100">{l.label}</span>
                <ArrowLeftIcon className="w-3.5 h-3.5 text-slate-300 ml-auto rotate-180 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>

          {stats.doctors.pending_verification > 0 && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                {stats.doctors.pending_verification} doctor(s) pending verification
              </p>
              <Link to="/admin/doctors" className="text-xs text-amber-600 dark:text-amber-400 hover:underline mt-0.5 inline-block font-medium">
                Review now →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
