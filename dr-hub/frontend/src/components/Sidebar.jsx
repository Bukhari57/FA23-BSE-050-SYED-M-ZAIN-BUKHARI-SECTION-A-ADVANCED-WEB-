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
    { to: '/patient/dashboard',     label: 'Dashboard',       icon: HomeIcon },
    { to: '/patient/doctors',       label: 'Find Doctors',    icon: SearchIcon },
    { to: '/patient/appointments',  label: 'Appointments',    icon: CalendarIcon },
    { to: '/patient/history',       label: 'Medical History', icon: ClipboardIcon },
    { to: '/patient/reports',       label: 'My Reports',      icon: FolderIcon },
    { to: '/patient/prescriptions', label: 'Prescriptions',   icon: PillIcon },
    { to: '/patient/messages',      label: 'Messages',        icon: MessageIcon },
  ],
  doctor: [
    { to: '/doctor/dashboard',    label: 'Dashboard',       icon: HomeIcon },
    { to: '/doctor/appointments', label: 'Appointments',    icon: CalendarIcon },
    { to: '/doctor/profile',      label: 'My Profile',      icon: UserIcon },
    { to: '/doctor/history',      label: 'Patient History', icon: ClipboardIcon },
    { to: '/doctor/messages',     label: 'Messages',        icon: MessageIcon },
  ],
  assistant: [
    { to: '/assistant/dashboard', label: 'Dashboard',       icon: HomeIcon },
    { to: '/assistant/payments',  label: 'Verify Payments', icon: CreditCardIcon },
    { to: '/assistant/messages',  label: 'Messages',        icon: MessageIcon },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard',        icon: ChartBarIcon },
    { to: '/admin/users',     label: 'Users',            icon: UsersIcon },
    { to: '/admin/doctors',   label: 'Dr. Verification', icon: BadgeCheckIcon },
    { to: '/admin/clinics',   label: 'Clinics',          icon: BuildingIcon },
    { to: '/admin/payments',  label: 'Payments',         icon: CreditCardIcon },
  ],
  super_admin: [
    { to: '/admin/dashboard', label: 'Dashboard',        icon: ChartBarIcon },
    { to: '/admin/users',     label: 'Users',            icon: UsersIcon },
    { to: '/admin/doctors',   label: 'Dr. Verification', icon: BadgeCheckIcon },
    { to: '/admin/clinics',   label: 'Clinics',          icon: BuildingIcon },
    { to: '/admin/payments',  label: 'Payments',         icon: CreditCardIcon },
  ],
};

const roleHomeMap = {
  patient:     '/patient/dashboard',
  doctor:      '/doctor/dashboard',
  assistant:   '/assistant/dashboard',
  admin:       '/admin/dashboard',
  super_admin: '/admin/dashboard',
};

const roleMeta = {
  patient:     { label: 'Patient',     color: 'bg-blue-500/20 text-blue-300',    dot: 'bg-blue-400' },
  doctor:      { label: 'Doctor',      color: 'bg-emerald-500/20 text-emerald-300', dot: 'bg-emerald-400' },
  assistant:   { label: 'Assistant',   color: 'bg-purple-500/20 text-purple-300', dot: 'bg-purple-400' },
  admin:       { label: 'Admin',       color: 'bg-amber-500/20 text-amber-300',  dot: 'bg-amber-400' },
  super_admin: { label: 'Super Admin', color: 'bg-rose-500/20 text-rose-300',    dot: 'bg-rose-400' },
};

function LogoIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14H8v-4H6v-2h2V9a3 3 0 016 0v2h2v2h-2v4h-2zm2-8V9a1 1 0 10-2 0v2h2z"/>
    </svg>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  if (!user) return null;
  const links = menus[user.role] || [];
  const meta  = roleMeta[user.role] || roleMeta.patient;

  const initials = user.name
    ? user.name.replace(/^Dr\.?\s*/i, '').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  useEffect(() => {
    onClose?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sidebarContent = (
    <aside className="w-64 h-full flex flex-col bg-slate-900 border-r border-slate-800/60">

      {/* Logo */}
      <Link
        to={roleHomeMap[user.role] || '/'}
        onClick={onClose}
        className="flex items-center gap-3 px-5 py-5 border-b border-slate-800/80 hover:opacity-90 transition-opacity"
      >
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
          <LogoIcon />
        </div>
        <div className="min-w-0">
          <span className="text-white font-black text-base leading-none tracking-tight block">Doctor Hub</span>
          <span className="text-slate-500 text-[10px] font-medium tracking-wide mt-0.5 block">Healthcare Platform</span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        <p className="section-label">Navigation</p>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            onClick={onClose}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/60 rounded-r-full" />
                )}
                <l.icon className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
                <span className="truncate">{l.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div className="px-3 py-4 border-t border-slate-800/80">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
              {initials}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${meta.dot}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-200 text-sm font-semibold truncate leading-tight">{user.name}</p>
            <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md capitalize mt-0.5 ${meta.color}`}>
              {meta.label}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <div className="hidden lg:flex lg:shrink-0 lg:w-64">
        {sidebarContent}
      </div>

      {/* Mobile overlay drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 flex transition-all duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className={`relative w-64 h-full transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
