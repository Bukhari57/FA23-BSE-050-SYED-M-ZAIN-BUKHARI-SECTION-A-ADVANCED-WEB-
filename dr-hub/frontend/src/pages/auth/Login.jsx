import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const roleHome = {
  patient: '/patient/dashboard', doctor: '/doctor/dashboard',
  assistant: '/assistant/dashboard', admin: '/admin/dashboard', super_admin: '/admin/dashboard',
};

const DEMO_ACCOUNTS = [
  { role: 'Patient',   email: 'patient@doctorhub.com',   pass: 'patient123',   color: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'   },
  { role: 'Doctor',    email: 'dr.ahmed@doctorhub.com',  pass: 'doctor123',    color: 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' },
  { role: 'Assistant', email: 'assistant@doctorhub.com', pass: 'assistant123', color: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20' },
  { role: 'Admin',     email: 'admin@doctorhub.com',     pass: 'admin123',     color: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'   },
];

const STATS = [
  { v: '500+', d: 'Verified Doctors' },
  { v: '10k+', d: 'Happy Patients'  },
  { v: '50+',  d: 'Specializations' },
  { v: '99.9%',d: 'Uptime'          },
];

function LogoIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14H8v-4H6v-2h2V9a3 3 0 016 0v2h2v2h-2v4h-2zm2-8V9a1 1 0 10-2 0v2h2z"/>
    </svg>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [err, setErr]         = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(roleHome[user.role] || '/');
    } catch (e) {
      setErr(e.response?.data?.message || 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  const fillDemo = (a) => { setForm({ email: a.email, password: a.pass }); setErr(''); };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950">

      {/* ── Left hero panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] xl:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/3 rounded-full" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
            <LogoIcon />
          </div>
          <div>
            <span className="text-white font-black text-xl leading-none block tracking-tight">Doctor Hub</span>
            <span className="text-blue-200 text-[11px] font-medium tracking-wide">Healthcare Platform</span>
          </div>
        </div>

        {/* Hero */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-blue-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-white/20">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Pakistan's Trusted Healthcare Platform
          </div>
          <h2 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] mb-5 tracking-tight">
            Your Health,<br />Our Priority
          </h2>
          <p className="text-blue-100 text-base xl:text-lg leading-relaxed max-w-sm">
            Access your appointments, medical history, prescriptions, and reports — all in one secure platform.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3">
            {STATS.map((s) => (
              <div key={s.v} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <p className="text-2xl font-black text-white leading-none">{s.v}</p>
                <p className="text-blue-200 text-sm mt-1 font-medium">{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-blue-300 text-xs">© {new Date().getFullYear()} Doctor Hub. All rights reserved.</p>
      </div>

      {/* ── Mobile header ── */}
      <div className="lg:hidden bg-gradient-to-br from-blue-600 to-indigo-700 px-6 pt-10 pb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
          <LogoIcon />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Doctor Hub</h1>
        <p className="text-blue-200 text-sm mt-1 font-medium">Healthcare Management Platform</p>
        <div className="mt-4 flex justify-center gap-5 text-xs font-medium text-blue-200">
          {STATS.slice(0, 3).map((s) => <span key={s.v}>{s.v} {s.d}</span>)}
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="flex-1 flex items-start lg:items-center justify-center p-5 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-[420px] py-4 lg:py-0">

          <div className="mb-7">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">Sign in to your account to continue</p>
          </div>

          {err && (
            <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {err}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <input type="email" required autoComplete="email"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input pl-10" placeholder="you@example.com" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <input type={showPass ? 'text' : 'password'} required autoComplete="current-password"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input pl-10 pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  {showPass
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  }
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2 shadow-lg shadow-blue-500/20">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">Create account</Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-6 p-4 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Demo accounts — tap to fill</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button key={a.role} type="button" onClick={() => fillDemo(a)}
                  className={`text-left px-3 py-2.5 rounded-xl border bg-white dark:bg-slate-800 transition-all active:scale-95 ${a.color} dark:border-slate-700`}>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{a.role}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{a.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
