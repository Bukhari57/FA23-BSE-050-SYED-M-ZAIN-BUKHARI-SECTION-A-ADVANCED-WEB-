import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  CalendarIcon, ClipboardIcon, FolderIcon, PillIcon,
  SearchIcon, ArrowLeftIcon, ClockIcon, CheckIcon,
} from '../../components/Icons';

const STATUS_COLORS = {
  pending:          { bg: 'bg-amber-50 dark:bg-amber-900/30',    text: 'text-amber-700 dark:text-amber-400'    },
  payment_uploaded: { bg: 'bg-blue-50 dark:bg-blue-900/30',     text: 'text-blue-700 dark:text-blue-400'     },
  payment_verified: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400' },
  confirmed:        { bg: 'bg-emerald-50 dark:bg-emerald-900/30',text: 'text-emerald-700 dark:text-emerald-400' },
  completed:        { bg: 'bg-slate-100 dark:bg-slate-700',      text: 'text-slate-600 dark:text-slate-300'   },
  cancelled:        { bg: 'bg-red-50 dark:bg-red-900/30',       text: 'text-red-600 dark:text-red-400'       },
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    api.get('/appointments')
      .then(({ data }) => setAppointments(data.data.appointments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const upcoming   = appointments.filter((a) => ['confirmed', 'payment_uploaded', 'pending'].includes(a.status));
  const completed  = appointments.filter((a) => a.status === 'completed');
  const nextAppt   = upcoming.sort((a, b) => new Date(`${a.appointment_date}T${a.appointment_time}`) - new Date(`${b.appointment_date}T${b.appointment_time}`))[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome header */}
      <div className="card p-6 bg-gradient-to-r from-blue-600 to-blue-800 border-0 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Welcome back,</p>
            <h1 className="text-2xl font-bold mt-0.5">{user?.name}</h1>
            <p className="text-blue-100 text-sm mt-1">
              {upcoming.length > 0
                ? `You have ${upcoming.length} upcoming appointment${upcoming.length > 1 ? 's' : ''}`
                : 'No upcoming appointments'}
            </p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        </div>

        {nextAppt && (
          <div className="mt-5 pt-4 border-t border-white/20">
            <p className="text-blue-100 text-xs font-medium mb-1">NEXT APPOINTMENT</p>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-white/70 flex-shrink-0" />
              <p className="text-white text-sm font-medium">
                {nextAppt.doctor_name} · {nextAppt.appointment_date} at {nextAppt.appointment_time?.slice(0,5)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Total Appts',   value: appointments.length, gradient: 'from-blue-500 to-blue-700',     icon: CalendarIcon },
          { label: 'Upcoming',      value: upcoming.length,     gradient: 'from-amber-400 to-orange-600',  icon: ClockIcon },
          { label: 'Completed',     value: completed.length,    gradient: 'from-emerald-500 to-emerald-700', icon: CheckIcon },
        ].map((s) => (
          <div key={s.label} className={`stat-card bg-gradient-to-br ${s.gradient}`}>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-xs font-medium text-white/80">{s.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{s.value}</p>
              </div>
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <s.icon className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { to: '/patient/doctors',       icon: SearchIcon,    label: 'Find a Doctor',     desc: 'Search by specialization or disease', color: 'hover:border-blue-200 dark:hover:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10' },
            { to: '/patient/appointments',  icon: CalendarIcon,  label: 'My Appointments',   desc: 'View bookings & upload payment',      color: 'hover:border-amber-200 dark:hover:border-amber-800 bg-amber-50/30 dark:bg-amber-900/10' },
            { to: '/patient/history',       icon: ClipboardIcon, label: 'Medical History',   desc: 'View diagnoses from your doctors',    color: 'hover:border-emerald-200 dark:hover:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10' },
            { to: '/patient/reports',       icon: FolderIcon,    label: 'My Reports',        desc: 'Lab results, X-rays, scans',          color: 'hover:border-violet-200 dark:hover:border-violet-800 bg-violet-50/30 dark:bg-violet-900/10' },
            { to: '/patient/prescriptions', icon: PillIcon,      label: 'Prescriptions',     desc: 'View and print your prescriptions',   color: 'hover:border-rose-200 dark:hover:border-rose-800 bg-rose-50/30 dark:bg-rose-900/10' },
          ].map((l) => (
            <Link key={l.to} to={l.to}
              className={`card border-2 border-transparent p-4 transition-all duration-200 group ${l.color}`}>
              <l.icon className="w-6 h-6 text-slate-500 dark:text-slate-400 mb-2 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{l.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{l.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent appointments */}
      {!loading && appointments.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Recent Appointments</h3>
            <Link to="/patient/appointments" className="text-xs text-blue-600 hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {appointments.slice(0, 4).map((a) => {
              const sc = STATUS_COLORS[a.status] || STATUS_COLORS.pending;
              return (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CalendarIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{a.doctor_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{a.appointment_date} · {a.appointment_time?.slice(0,5)}</p>
                  </div>
                  <span className={`badge ${sc.bg} ${sc.text} capitalize whitespace-nowrap text-[11px]`}>
                    {a.status.replace(/_/g,' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
