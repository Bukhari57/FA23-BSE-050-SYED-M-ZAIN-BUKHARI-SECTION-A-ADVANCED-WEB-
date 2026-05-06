'use client';

import { FormEvent, useEffect, useState } from 'react';

type User = { id: string; name: string; email: string; role: string };

type PendingAd = { id: string; title: string; description: string; status: string; package: { name: string } };

export default function ModeratorDashboard() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [statusMessage, setStatusMessage] = useState('Loading moderator session...');
  const [ads, setAds] = useState<PendingAd[]>([]);
  const [decision, setDecision] = useState('APPROVED');
  const [feedback, setFeedback] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [flagSuspicious, setFlagSuspicious] = useState(false);
  const [selectedId, setSelectedId] = useState('');
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
          setStatusMessage('Please login with a moderator account.');
        });
    } else {
      setStatusMessage('Please login to view the moderator dashboard.');
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch('/api/moderator/pending', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setAds(data))
      .catch(() => setAds([]));
  }, [token]);

  async function handleReview(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    const response = await fetch(`/api/moderator/review/${selectedId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ decision, feedback, internalNotes, suspiciousMedia: flagSuspicious }),
    });
    const body = await response.json();
    if (response.ok) {
      setMessage('Review submitted successfully.');
      setAds((prev) => prev.filter((ad) => ad.id !== selectedId));
      setSelectedId('');
      setDecision('APPROVED');
      setFeedback('');
      setInternalNotes('');
      setFlagSuspicious(false);
    } else {
      setMessage(body.error || 'Failed to review ad');
    }
  }

  if (!token) {
    return <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">{statusMessage}</div>;
  }

  if (!user) {
    return <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">{statusMessage}</div>;
  }

  if (user.role !== 'MODERATOR') {
    return <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">Access denied. Moderators only.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-3xl font-semibold">Moderator Dashboard</h2>
        <p className="mt-2 text-slate-400">Review pending ads and move them to approved or rejected status.</p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-semibold">Pending Ads</h3>
          <div className="mt-4 space-y-3">
            {ads.length === 0 ? (
              <p className="text-slate-400">No pending ads. Use the public user workflow to submit ads.</p>
            ) : (
              ads.map((ad) => (
                <button
                  key={ad.id}
                  onClick={() => setSelectedId(ad.id)}
                  className={`block w-full rounded-3xl border px-4 py-4 text-left ${selectedId === ad.id ? 'border-cyan-500 bg-slate-800' : 'border-slate-700 bg-slate-900 hover:border-slate-500'}`}
                >
                  <p className="text-sm text-slate-400">{ad.package.name}</p>
                  <p className="font-semibold text-slate-100">{ad.title}</p>
                  <p className="mt-2 text-slate-400">{ad.description}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <form onSubmit={handleReview} className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-semibold">Review selected ad</h3>
          <label className="block space-y-2 text-sm">
            <span>Ad ID</span>
            <input value={selectedId} onChange={(e) => setSelectedId(e.target.value)} required />
          </label>
          <label className="block space-y-2 text-sm">
            <span>Decision</span>
            <select value={decision} onChange={(e) => setDecision(e.target.value)}>
              <option value="APPROVED">Approve</option>
              <option value="REJECTED">Reject</option>
            </select>
          </label>
          <label className="block space-y-2 text-sm">
            <span>Feedback / rejection reason</span>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3} />
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={flagSuspicious} onChange={(e) => setFlagSuspicious(e.target.checked)} />
            <span>Flag suspicious media</span>
          </label>
          <label className="block space-y-2 text-sm">
            <span>Internal notes</span>
            <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={3} />
          </label>
          <button type="submit" className="w-full rounded bg-amber-500 px-4 py-3 font-semibold text-slate-950 hover:bg-amber-400">
            Submit review
          </button>
        </form>
      </section>

      {message ? <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 text-slate-200">{message}</div> : null}
    </div>
  );
}
