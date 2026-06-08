import { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon, CalendarIcon, UserIcon, UsersIcon, ClipboardIcon, FolderIcon,
  PillIcon, CreditCardIcon, SearchIcon, BadgeCheckIcon, BuildingIcon,
  ChartBarIcon, MessageIcon,
} from './Icons';

const menus = {
  patient: [
    { to: '/patient/dashboard',    label: 'Dashboard',       icon: HomeIcon },
    { to: '/patient/doctors',      label: 'Find Doctors',    icon: SearchIcon },
    { to: '/patient/appointments', label: 'Appointments',    icon: CalendarIcon },
    { to: '/patient/history',      label: 'Medical History', icon: ClipboardIcon },
    { to: '/patient/reports',      label: 'My Reports',      icon: FolderIcon },
    { to: '/patient/prescriptions',label: 'Prescriptions',   icon: PillIcon },
    { to: '/patient/messages',     label: 'Messages',         icon: MessageIcon },
  ],
  doctor: [
    { to: '/doctor/dashboard',    label: 'Dashboard',        icon: HomeIcon },
    { to: '/doctor/appointments', label: 'Appointments',     icon: CalendarIcon },
    { to: '/doctor/profile',      label: 'My Profile',       icon: UserIcon },
    { to: '/doctor/history',      label: 'Patient History',  icon: ClipboardIcon },
    { to: '/doctor/messages',     label: 'Messages',          icon: MessageIcon },
  ],
  assistant: [
    { to: '/assistant/dashboard', label: 'Dashboard',        icon: HomeIcon },
    { to: '/assistant/payments',  label: 'Verify Payments',  icon: CreditCardIcon },
    { to: '/assistant/messages',  label: 'Messages',          icon: MessageIcon },
  ],
  admin: [
    { to: '/admin/dashboard',  label: 'Dashboard',           icon: ChartBarIcon },
    { to: '/admin/users',      label: 'Users',               icon: UsersIcon },
    { to: '/admin/doctors',    label: 'Dr. Verification',    icon: BadgeCheckIcon },
    { to: '/admin/clinics',    label: 'Clinics',             icon: BuildingIcon },
    { to: '/admin/payments',   label: 'Payments',            icon: CreditCardIcon },
  ],
  super_admin: [
    { to: '/admin/dashboard',  label: 'Dashboard',           icon: ChartBarIcon },
    { to: '/admin/users',      label: 'Users',               icon: UsersIcon },
    { to: '/admin/doctors',    label: 'Dr. Verification',    icon: BadgeCheckIcon },
    { to: '/admin/clinics',    label: 'Clinics',             icon: BuildingIcon },
    { to: '/admin/payments',   label: 'Payments',            icon: CreditCardIcon },
  ],
};

const roleHomeMap = {
  patient:     '/patient/dashboard',
  doctor:      '/doctor/dashboard',
  assistant:   '/assistant/dashboard',
  admin:       '/admin/dashboard',
  super_admin: '/admin/dashboard',
};

const roleBadge = {
  patient:     'bg-blue-500/20 text-blue-300',
  doctor:      'bg-emerald-500/20 text-emerald-300',
  assistant:   'bg-purple-500/20 text-purple-300',
  admin:       'bg-amber-500/20 text-amber-300',
  super_admin: 'bg-rose-500/20 text-rose-300',
};

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  if (!user) return null;
  const links = menus[user.role] || [];

  const initials = user.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sidebarContent = (
    <aside className="w-64 h-full bg-slate-900 flex flex-col">
      {/* Logo */}
      <Link
        to={roleHomeMap[user.role] || '/'}
        onClick={onClose}
        className="flex items-center gap-3 px-6 py-5 border-b border-slate-800 hover:opacity-90 transition-opacity"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14H8v-4H6v-2h2V9a3 3 0 016 0v2h2v2h-2v4h-2zm2-8V9a1 1 0 10-2 0v2h2z"/>
          </svg>
        </div>
        <div>
          <span className="text-white font-extrabold text-base leading-tight block">Dr Hub</span>
          <span className="text-slate-400 text-[11px] leading-tight">Healthcare Platform</span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`
            }
          >
            <l.icon className="w-[18px] h-[18px] flex-shrink-0" />
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* User info footer */}
      <div className="px-4 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-200 text-sm font-medium truncate leading-tight">{user.name}</p>
            <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md capitalize mt-0.5 ${roleBadge[user.role] || 'bg-slate-700 text-slate-400'}`}>
              {user.role.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: static sidebar */}
      <div className="hidden lg:flex lg:shrink-0 lg:w-64">
        {sidebarContent}
      </div>

      {/* Mobile: overlay drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 flex transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60"
          onClick={onClose}
        />
        {/* Drawer */}
        <div
          className={`relative w-64 h-full transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
