import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const FEATURES = [
  { icon: '🏥', text: 'Book appointments with verified doctors' },
  { icon: '💊', text: 'Access digital prescriptions anytime'    },
  { icon: '📋', text: 'Store and view your full medical history'},
  { icon: '🔒', text: 'Bank-grade security for your records'    },
];

function LogoIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14H8v-4H6v-2h2V9a3 3 0 016 0v2h2v2h-2v4h-2zm2-8V9a1 1 0 10-2 0v2h2z"/>
    </svg>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', phone: '' });
  const [err, setErr]         = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      await register(form);
      navigate('/patient/dashboard');
    } catch (e) {
      setErr(e.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950">

      {/* ── Left hero panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] xl:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 p-12 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
            <LogoIcon />
          </div>
          <div>
            <span className="text-white font-black text-xl leading-none block tracking-tight">Doctor Hub</span>
            <span className="text-emerald-200 text-[11px] font-medium tracking-wide">Healthcare Platform</span>
          </div>
        </div>

        {/* Hero */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-white/20">
            <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
            Join Thousands of Patients
          </div>
          <h2 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] mb-5 tracking-tight">
            Start Your<br />Health Journey
          </h2>
          <p className="text-emerald-100 text-base xl:text-lg leading-relaxed max-w-sm">
            Register as a patient and get instant access to top doctors, easy appointments, and your complete medical records.
          </p>
          <div className="mt-10 space-y-3">
            {FEATURES.map((f) => (
              <div key={f.text} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                <span className="text-lg flex-shrink-0">{f.icon}</span>
                <p className="text-white text-sm font-medium">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-emerald-300 text-xs">© {new Date().getFullYear()} Doctor Hub. All rights reserved.</p>
      </div>

      {/* ── Mobile header ── */}
      <div className="lg:hidden bg-gradient-to-br from-emerald-600 to-teal-700 px-6 pt-10 pb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
          <LogoIcon />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Doctor Hub</h1>
        <p className="text-emerald-200 text-sm mt-1 font-medium">Healthcare Management Platform</p>
      </div>

      {/* ── Form panel ── */}
      <div className="flex-1 flex items-start lg:items-center justify-center p-5 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-[420px] py-4 lg:py-0">

          <div className="mb-7">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Create account</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">Join thousands of patients on Doctor Hub</p>
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
            {/* Name */}
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <input type="text" required value={form.name} onChange={f('name')}
                  className="input pl-10" placeholder="Ali Ahmed" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <input type="email" required autoComplete="email" value={form.email} onChange={f('email')}
                  className="input pl-10" placeholder="you@example.com" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="label">Phone <span className="text-slate-400 font-normal">(optional)</span></label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <input type="tel" value={form.phone} onChange={f('phone')}
                  className="input pl-10" placeholder="0300-1234567" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <input type={showPass ? 'text' : 'password'} required minLength={6} value={form.password} onChange={f('password')}
                  className="input pl-10 pr-10" placeholder="Min. 6 characters" />
                <button type="button" onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  {showPass
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  }
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 text-base font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 mt-2">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account…
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
