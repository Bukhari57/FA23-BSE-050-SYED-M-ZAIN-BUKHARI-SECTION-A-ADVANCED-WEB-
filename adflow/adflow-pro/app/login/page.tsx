'use client';

import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const body = await response.json();
    if (response.ok) {
      localStorage.setItem('adflow-token', body.token);
      setMessage('Logged in successfully. Use dashboards to access your role views.');
    } else {
      setMessage(body.error || 'Login failed');
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-3xl font-semibold">Login</h2>
        <p className="mt-2 text-slate-400">Use credentials like admin@adflow.local / password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <label className="block space-y-2 text-sm">
          <span>Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label className="block space-y-2 text-sm">
          <span>Password</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <button type="submit" className="w-full rounded bg-cyan-600 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-500">
          Sign in
        </button>
      </form>

      {message ? <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 text-slate-200">{message}</div> : null}
    </div>
  );
}
