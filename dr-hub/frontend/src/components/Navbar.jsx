import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import { BellIcon, LogoutIcon, ChevronDownIcon } from './Icons';

const PAGE_TITLES = {
  '/patient/dashboard':    'Dashboard',
  '/patient/doctors':      'Find Doctors',
  '/patient/appointments': 'My Appointments',
  '/patient/history':      'Medical History',
  '/patient/reports':      'My Reports',
  '/patient/prescriptions':'Prescriptions',
  '/patient/messages':     'Messages',
  '/doctor/dashboard':     'Dashboard',
  '/doctor/appointments':  'Appointments',
  '/doctor/profile':       'My Profile',
  '/doctor/history':       'Patient History',
  '/doctor/messages':      'Messages',
  '/assistant/dashboard':  'Dashboard',
  '/assistant/payments':   'Verify Payments',
  '/assistant/messages':   'Messages',
  '/admin/dashboard':      'Dashboard',
  '/admin/users':          'User Management',
  '/admin/doctors':        'Doctor Verification',
  '/admin/clinics':        'Clinics',
  '/admin/payments':       'Payments',
};

const roleMeta = {
  patient:     { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',       label: 'Patient' },
  doctor:      { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', label: 'Doctor' },
  assistant:   { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',  label: 'Assistant' },
  admin:       { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',    label: 'Admin' },
  super_admin: { color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',        label: 'Super Admin' },
};

function SunIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M18.364 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export default function Navbar({ onMenuClick }) {
  const { user, logout }  = useAuth();
  const { dark, toggle }  = useTheme();
  const navigate          = useNavigate();
  const location          = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]               = useState(0);
  const [showNotif, setShowNotif]         = useState(false);
  const [showUser, setShowUser]           = useState(false);
  const notifRef = useRef(null);
  const userRef  = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] || 'Doctor Hub';
  const meta      = roleMeta[user?.role] || roleMeta.patient;

  useEffect(() => {
    if (!user) return;
    api.get('/reports/notifications').then(({ data }) => {
      setNotifications(data.data.notifications || []);
      setUnread(data.data.unread || 0);
    }).catch(() => {});
  }, [user, location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setShowUser(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = () => {
    api.patch('/reports/notifications/read').catch(() => {});
    setUnread(0);
    setNotifications((n) => n.map((x) => ({ ...x, is_read: true })));
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ? user.name.replace(/^Dr\.?\s*/i, '').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <header className="h-14 sm:h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-40"
      style={{ boxShadow: '0 1px 0 0 rgb(0 0 0 / 0.06)' }}>

      {/* Left */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate tracking-tight">{pageTitle}</h1>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1 flex-shrink-0">

        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          aria-label="Toggle dark mode"
          title={dark ? 'Light mode' : 'Dark mode'}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:text-slate-700 dark:hover:text-slate-200"
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotif((v) => !v); if (!showNotif && unread > 0) markRead(); }}
            className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:text-slate-700 dark:hover:text-slate-200"
            aria-label="Notifications"
          >
            <BellIcon className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="dropdown absolute right-0 top-full mt-2 w-72 sm:w-80 animate-slide-up">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</p>
                  {unread > 0 && <p className="text-[11px] text-slate-400 mt-0.5">{unread} unread</p>}
                </div>
                {notifications.length > 0 && (
                  <button onClick={markRead} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-2">
                      <BellIcon className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">No notifications yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div key={n.id}
                      className={`border-b border-slate-50 dark:border-slate-700/50 px-4 py-3 last:border-0 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40 ${
                        !n.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}>
                      {!n.is_read && (
                        <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mb-1" />
                      )}
                      <p className={`text-sm font-semibold leading-tight ${!n.is_read ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1">
                        {new Date(n.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUser((v) => !v)}
            className="flex items-center gap-2 rounded-xl pl-1.5 pr-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">{user?.name}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
            <ChevronDownIcon className={`hidden sm:block w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showUser ? 'rotate-180' : ''}`} />
          </button>

          {showUser && (
            <div className="dropdown absolute right-0 top-full mt-2 w-56 animate-slide-up">
              <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-700/80">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{user?.email}</p>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${meta.color}`}>
                  {meta.label}
                </span>
              </div>
              <div className="p-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogoutIcon className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
