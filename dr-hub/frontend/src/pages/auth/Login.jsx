import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const roleHome = {
  patient: '/patient/dashboard', doctor: '/doctor/dashboard',
  assistant: '/assistant/dashboard', admin: '/admin/dashboard', super_admin: '/admin/dashboard',
};

const DEMO_ACCOUNTS = [
  { role: 'Patient',   email: 'patient@doctorhub.com',   pass: 'patient123'   },
  { role: 'Doctor',    email: 'dr.ahmed@doctorhub.com',  pass: 'doctor123'    },
  { role: 'Assistant', email: 'assistant@doctorhub.com', pass: 'assistant123' },
  { role: 'Admin',     email: 'admin@doctorhub.com',     pass: 'admin123'     },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [err, setErr]         = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(roleHome[user.role] || '/');
    } catch (e) {
      setErr(e.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account) => {
    setForm({ email: account.email, password: account.pass });
    setErr('');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">

      {/* ── Desktop left panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14H8v-4H6v-2h2V9a3 3 0 016 0v2h2v2h-2v4h-2zm2-8V9a1 1 0 10-2 0v2h2z"/>
            </svg>
          </div>
          <div>
            <span className="text-white font-extrabold text-xl leading-none block">Dr Hub</span>
            <span className="text-blue-200 text-[11px]">Healthcare Platform</span>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Your Health,<br />Our Priority
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Access your appointments, medical history, prescriptions, and reports — all in one secure platform.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: '500+', desc: 'Verified Doctors' },
              { label: '10k+', desc: 'Happy Patients'  },
              { label: '50+',  desc: 'Specializations' },
              { label: '99.9%',desc: 'Uptime'          },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-2xl font-bold text-white">{s.label}</p>
                <p className="text-blue-100 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-blue-200 text-sm">© {new Date().getFullYear()} Dr Hub. All rights reserved.</p>
      </div>

      {/* ── Mobile top banner ──────────────────────────────────────────── */}
      <div className="lg:hidden bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14H8v-4H6v-2h2V9a3 3 0 016 0v2h2v2h-2v4h-2zm2-8V9a1 1 0 10-2 0v2h2z"/>
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Dr Hub</h1>
        <p className="text-blue-200 text-sm mt-1">Healthcare Management Platform</p>
        <div className="mt-4 flex justify-center gap-4 text-xs text-blue-200">
          <span>500+ Doctors</span>
          <span className="opacity-40">|</span>
          <span>10k+ Patients</span>
          <span className="opacity-40">|</span>
          <span>50+ Specializations</span>
        </div>
      </div>

      {/* ── Right / form panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-start lg:items-center justify-center p-5 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-md py-4 lg:py-0">

          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 mt-1 text-sm sm:text-base">Sign in to your account to continue</p>
          </div>

          {err && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {err}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="label">Email address</label>
              <input
                type="email" required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password" required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-1">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-semibold">Create account</Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Demo Accounts — click to fill</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.role}
                  type="button"
                  onClick={() => fillDemo(a)}
                  className="text-left px-3 py-2 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <p className="text-xs font-semibold text-slate-700">{a.role}</p>
                  <p className="text-[11px] text-slate-400 truncate">{a.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
