import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axios';
import {
  CalendarIcon, UserIcon, ClipboardIcon, ChartBarIcon, ArrowLeftIcon, ClockIcon,
} from '../../components/Icons';

const STATUS_COLORS = {
  pending:          { bg: 'bg-amber-50 dark:bg-amber-900/30',    text: 'text-amber-700 dark:text-amber-400',    dot: 'bg-amber-400'   },
  payment_uploaded: { bg: 'bg-blue-50 dark:bg-blue-900/30',     text: 'text-blue-700 dark:text-blue-400',     dot: 'bg-blue-400'    },
  payment_verified: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', dot: 'bg-indigo-400'  },
  confirmed:        { bg: 'bg-emerald-50 dark:bg-emerald-900/30',text: 'text-emerald-700 dark:text-emerald-400',dot: 'bg-emerald-400' },
  completed:        { bg: 'bg-slate-100 dark:bg-slate-700',      text: 'text-slate-600 dark:text-slate-300',   dot: 'bg-slate-400'   },
  cancelled:        { bg: 'bg-red-50 dark:bg-red-900/30',       text: 'text-red-600 dark:text-red-400',       dot: 'bg-red-400'     },
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { dark } = useTheme();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    api.get('/appointments')
      .then(({ data }) => setAppointments(data.data.appointments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayAppts    = appointments.filter((a) => a.appointment_date === today);
  const confirmed     = appointments.filter((a) => a.status === 'confirmed');
  const completed     = appointments.filter((a) => a.status === 'completed');
  const pending       = appointments.filter((a) => ['pending', 'payment_uploaded'].includes(a.status));

  const barData = [
    { name: 'Pending',   value: pending.length,       fill: '#f59e0b' },
    { name: 'Confirmed', value: confirmed.length,     fill: '#10b981' },
    { name: 'Completed', value: completed.length,     fill: '#6366f1' },
    { name: 'Cancelled', value: appointments.filter((a) => a.status === 'cancelled').length, fill: '#ef4444' },
  ];

  const uniquePatients = new Set(appointments.map((a) => a.patient_id)).size;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-header">Good day, {user?.name?.replace(/^Dr\.?\s*/i, '').split(' ')[0]}</h1>
        <p className="page-subtitle">Here's your practice overview for today</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Appts", value: todayAppts.length, icon: ClockIcon,     gradient: 'bg-gradient-to-br from-blue-500 to-blue-700' },
          { label: 'Pending',       value: pending.length,    icon: CalendarIcon,  gradient: 'bg-gradient-to-br from-amber-400 to-orange-600' },
          { label: 'Confirmed',     value: confirmed.length,  icon: ChartBarIcon,  gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-700' },
          { label: 'Total Patients',value: uniquePatients,    icon: UserIcon,      gradient: 'bg-gradient-to-br from-violet-500 to-purple-700' },
        ].map((s) => (
          <div key={s.label} className={`stat-card ${s.gradient}`}>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-white/80">{s.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{s.value}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <s.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Appointment Breakdown</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">All time status distribution</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#334155' : '#f1f5f9'} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, backgroundColor: dark ? '#1e293b' : '#fff', color: dark ? '#e2e8f0' : '#0f172a', fontSize: 12 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Today's appointments */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Today's Schedule</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {todayAppts.length === 0 ? 'No appointments today' : `${todayAppts.length} appointment(s)`}
              </p>
            </div>
            <Link to="/doctor/appointments" className="text-xs text-blue-600 hover:underline font-medium">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : todayAppts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <CalendarIcon className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {todayAppts.map((a) => {
                const sc = STATUS_COLORS[a.status] || STATUS_COLORS.pending;
                return (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-xl flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{a.patient_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{a.appointment_time?.slice(0,5)} · {a.clinic_name}</p>
                    </div>
                    <span className={`badge ${sc.bg} ${sc.text} capitalize whitespace-nowrap`}>
                      {a.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/doctor/appointments', icon: CalendarIcon,  label: 'All Appointments',  desc: 'View and manage your schedule',   color: 'border-blue-100 dark:border-blue-900/50 hover:border-blue-300 bg-blue-50/50 dark:bg-blue-900/10' },
          { to: '/doctor/history',      icon: ClipboardIcon, label: 'Patient History',    desc: 'Add records and prescriptions',   color: 'border-emerald-100 dark:border-emerald-900/50 hover:border-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/10' },
          { to: '/doctor/profile',      icon: UserIcon,      label: 'My Profile',         desc: 'Update schedule and clinics',     color: 'border-violet-100 dark:border-violet-900/50 hover:border-violet-300 bg-violet-50/50 dark:bg-violet-900/10' },
        ].map((l) => (
          <Link key={l.to} to={l.to}
            className={`card border-2 p-5 transition-all duration-200 group ${l.color}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl shadow-card flex items-center justify-center">
                <l.icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <ArrowLeftIcon className="w-4 h-4 text-slate-300 rotate-180 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{l.label}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{l.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
