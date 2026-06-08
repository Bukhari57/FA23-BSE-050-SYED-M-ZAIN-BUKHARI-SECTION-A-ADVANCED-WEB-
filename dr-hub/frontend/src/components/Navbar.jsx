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

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { dark, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] || 'Doctor Hub';

  useEffect(() => {
    if (user) {
      api.get('/reports/notifications').then(({ data }) => {
        setNotifications(data.data.notifications || []);
        setUnread(data.data.unread || 0);
      }).catch(() => {});
    }
  }, [user, location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = () => {
    api.patch('/reports/notifications/read').catch(() => {});
    setUnread(0);
    setNotifications((n) => n.map((x) => ({ ...x, is_read: true })));
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const roleColors = {
    patient:     'bg-blue-100 text-blue-700',
    doctor:      'bg-emerald-100 text-emerald-700',
    assistant:   'bg-purple-100 text-purple-700',
    admin:       'bg-amber-100 text-amber-700',
    super_admin: 'bg-rose-100 text-rose-700',
  };

  return (
    <header className="h-14 sm:h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-40 shadow-sm">
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Toggle dark mode"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M18.364 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotif(!showNotif); if (!showNotif && unread > 0) handleMarkRead(); }}
            className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <BellIcon className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-12 w-72 sm:w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-card-lg border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-slide-up">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">Notifications</p>
                {notifications.length > 0 && (
                  <button onClick={handleMarkRead} className="text-xs text-blue-600 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-400 text-sm">No notifications</div>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div key={n.id}
                      className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${!n.is_read ? 'bg-blue-50/40' : ''}`}
                    >
                      <p className={`text-sm font-medium ${!n.is_read ? 'text-slate-900' : 'text-slate-600'}`}>{n.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                      <p className="text-[11px] text-slate-300 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
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
            onClick={() => setShowUser(!showUser)}
            className="flex items-center gap-2 pl-1.5 sm:pl-2 pr-2 sm:pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-900 leading-tight">{user?.name}</p>
              <p className="text-[11px] text-slate-400 leading-tight capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            <ChevronDownIcon className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {showUser && (
            <div className="absolute right-0 top-12 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-card-lg border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-slide-up">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{user?.email}</p>
                <span className={`mt-1.5 inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${roleColors[user?.role] || 'bg-slate-100 text-slate-600'}`}>
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
              <div className="p-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
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
