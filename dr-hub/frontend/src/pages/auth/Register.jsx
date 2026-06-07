import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', phone: '' });
  const [err, setErr]         = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await register(form);
      navigate('/patient/dashboard');
    } catch (e) {
      setErr(e.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">

      {/* ── Desktop left panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none opacity-10">
          <div className="absolute top-32 right-16 w-72 h-72 bg-white rounded-full" />
          <div className="absolute bottom-16 left-16 w-80 h-80 bg-white rounded-full" />
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
            <span className="text-emerald-200 text-[11px]">Healthcare Platform</span>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Start Your<br />Health Journey
          </h2>
          <p className="text-emerald-100 text-lg leading-relaxed">
            Register as a patient and get instant access to top doctors, easy appointments, and your complete medical records.
          </p>
          <div className="mt-10 space-y-3">
            {[
              { icon: '🏥', text: 'Book appointments with verified doctors' },
              { icon: '💊', text: 'Access digital prescriptions anytime'    },
              { icon: '📋', text: 'Store and view your medical history'     },
              { icon: '🔒', text: 'Bank-grade security for your records'    },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <span className="text-xl">{f.icon}</span>
                <p className="text-white text-sm font-medium">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-emerald-200 text-sm">© {new Date().getFullYear()} Dr Hub. All rights reserved.</p>
      </div>

      {/* ── Mobile top banner ──────────────────────────────────────────── */}
      <div className="lg:hidden bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14H8v-4H6v-2h2V9a3 3 0 016 0v2h2v2h-2v4h-2zm2-8V9a1 1 0 10-2 0v2h2z"/>
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Dr Hub</h1>
        <p className="text-emerald-200 text-sm mt-1">Healthcare Management Platform</p>
        <div className="mt-4 flex justify-center gap-4 text-xs text-emerald-200">
          <span>500+ Doctors</span>
          <span className="opacity-40">|</span>
          <span>50+ Specializations</span>
          <span className="opacity-40">|</span>
          <span>Secure &amp; Private</span>
        </div>
      </div>

      {/* ── Right / form panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-start lg:items-center justify-center p-5 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-md py-4 lg:py-0">

          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Create account</h1>
            <p className="text-slate-500 mt-1 text-sm sm:text-base">Join thousands of patients on Dr Hub</p>
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
              <label className="label">Full Name</label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input" placeholder="Ali Ahmed" />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="label">
                Phone <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input type="tel" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input" placeholder="0300-1234567" />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" required minLength={6} value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input" placeholder="Min. 6 characters" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-1">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
