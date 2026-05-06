'use client';

import { FormEvent, useState } from 'react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const body = await response.json();
    if (response.ok) {
      setMessage('Account created. Please login.');
      setName('');
      setEmail('');
      setPassword('');
    } else {
      setMessage(body.error || 'Registration failed');
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-3xl font-semibold">Register</h2>
        <p className="mt-2 text-slate-400">Create a user account and start submitting ads.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <label className="block space-y-2 text-sm">
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" required />
        </label>
        <label className="block space-y-2 text-sm">
          <span>Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label className="block space-y-2 text-sm">
          <span>Password</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <button type="submit" className="w-full rounded bg-emerald-600 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-500">
          Register
        </button>
      </form>

      {message ? <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 text-slate-200">{message}</div> : null}
    </div>
  );
}
