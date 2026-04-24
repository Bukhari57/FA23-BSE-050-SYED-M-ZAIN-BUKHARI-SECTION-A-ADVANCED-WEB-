'use client';

import { FormEvent, useEffect, useState } from 'react';

type User = { id: string; name: string; email: string; role: string };

type Payment = { id: string; transactionId: string; proofUrl: string | null; status: string; ad: { id: string; title: string; status: string; } };

export default function AdminDashboard() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [statusMessage, setStatusMessage] = useState('Loading admin session...');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [action, setAction] = useState('approve');
  const [featureAd, setFeatureAd] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('adflow-token');
    if (saved) {
      setToken(saved);
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${saved}` } })
        .then((res) => {
          if (!res.ok) throw new Error('Unauthorized');
          return res.json();
        })
        .then((data) => {
          setUser(data);
          setStatusMessage('Logged in as ' + data.role);
        })
        .catch(() => {
          setUser(null);
          setStatusMessage('Please login with an admin account.');
        });
    } else {
      setStatusMessage('Please login to view the admin dashboard.');
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch('/api/admin/payments', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setPayments(data))
      .catch(() => setPayments([]));
  }, [token]);

  async function handleVerify(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    const bodyData: any = { action, featured: featureAd };
    if (startDate) bodyData.startDate = startDate;
    if (endDate) bodyData.endDate = endDate;

    const response = await fetch(`/api/admin/payments/verify/${selectedId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(bodyData),
    });
    const body = await response.json();
    if (response.ok) {
      setMessage('Payment review updated.');
      setPayments((prev) => prev.filter((payment) => payment.id !== selectedId));
      setSelectedId('');
      setFeatureAd(false);
      setStartDate('');
      setEndDate('');
    } else {
      setMessage(body.error || 'Failed to verify payment');
    }
  }

  if (!token) {
    return <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">{statusMessage}</div>;
  }

  if (!user) {
    return <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">{statusMessage}</div>;
  }

  if (user.role !== 'ADMIN') {
    return <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">Access denied. Admins only.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-3xl font-semibold">Admin Dashboard</h2>
        <p className="mt-2 text-slate-400">Verify payments and schedule approved ads.</p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-semibold">Pending Payments</h3>
          <div className="mt-4 space-y-3">
            {payments.length === 0 ? (
              <p className="text-slate-400">No payments pending review.</p>
            ) : (
              payments.map((payment) => (
                <button
                  key={payment.id}
                  onClick={() => setSelectedId(payment.id)}
                  className={`block w-full rounded-3xl border px-4 py-4 text-left ${selectedId === payment.id ? 'border-cyan-500 bg-slate-800' : 'border-slate-700 bg-slate-900 hover:border-slate-500'}`}
                >
                  <p className="text-sm text-slate-400">Ad: {payment.ad.title}</p>
                  <p className="font-semibold text-slate-100">Transaction {payment.transactionId}</p>
                  <p className="mt-2 text-slate-400">Ad status: {payment.ad.status}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-semibold">Verify Payment</h3>
          <label className="block space-y-2 text-sm">
            <span>Payment ID</span>
            <input value={selectedId} onChange={(e) => setSelectedId(e.target.value)} required />
          </label>
          <label className="block space-y-2 text-sm">
            <span>Action</span>
            <select value={action} onChange={(e) => setAction(e.target.value)}>
              <option value="approve">Approve</option>
              <option value="reject">Reject</option>
            </select>
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={featureAd} onChange={(e) => setFeatureAd(e.target.checked)} />
            <span>Feature this ad on approval</span>
          </label>
          <label className="block space-y-2 text-sm">
            <span>Start date (optional)</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label className="block space-y-2 text-sm">
            <span>End date (optional)</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
          <button type="submit" className="w-full rounded bg-amber-500 px-4 py-3 font-semibold text-slate-950 hover:bg-amber-400">
            Update payment
          </button>
        </form>
      </section>

      {message ? <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 text-slate-200">{message}</div> : null}
    </div>
  );
}
