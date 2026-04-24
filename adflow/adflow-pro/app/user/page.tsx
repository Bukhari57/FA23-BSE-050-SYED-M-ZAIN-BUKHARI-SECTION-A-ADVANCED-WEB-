'use client';

import { FormEvent, useEffect, useState } from 'react';

type Package = { id: string; name: string; price: number; durationDays: number; priority: number; featured: boolean };

type Ad = {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  status: string;
  package: Package;
  createdAt: string;
};

export default function UserDashboard() {
  const [token, setToken] = useState('');
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [submitAdId, setSubmitAdId] = useState('');
  const [editAdId, setEditAdId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editMediaUrl, setEditMediaUrl] = useState('');
  const [editThumbnailUrl, setEditThumbnailUrl] = useState('');
  const [editPackageId, setEditPackageId] = useState('');
  const [ads, setAds] = useState<Ad[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('adflow-token');
    if (saved) setToken(saved);
    fetch('/api/packages')
      .then((res) => res.json())
      .then((data) => setPackages(data))
      .catch(() => setPackages([]));
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch('/api/ads?mine=true', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setAds(data))
      .catch(() => setAds([]));
  }, [token]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    const response = await fetch('/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, description, mediaUrl, thumbnailUrl, packageId: selectedPackage }),
    });
    const body = await response.json();
    if (response.ok) {
      setMessage('Draft created successfully. Use ad ID to submit payment.');
      setTitle('');
      setDescription('');
      setMediaUrl('');
      setThumbnailUrl('');
      setSelectedPackage('');
      setAds((prev) => [body, ...prev]);
    } else {
      setMessage(body.error || 'Failed to create ad');
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    const response = await fetch('/api/ads/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ adId: submitAdId, transactionId, proofUrl }),
    });
    const body = await response.json();
    if (response.ok) {
      setMessage('Ad submitted for review and payment verification.');
      setSubmitAdId('');
      setTransactionId('');
      setProofUrl('');
      setAds((prev) => prev.map((ad) => (ad.id === body.id ? body : ad)));
    } else {
      setMessage(body.error || 'Failed to submit ad');
    }
  }

  function selectDraft(ad: Ad) {
    if (ad.status !== 'DRAFT') {
      setMessage('Only drafts can be edited.');
      return;
    }
    setEditAdId(ad.id);
    setEditTitle(ad.title);
    setEditDescription(ad.description);
    setEditMediaUrl(ad.mediaUrl);
    setEditThumbnailUrl(ad.thumbnailUrl || '');
    setEditPackageId(ad.package.id);
    setMessage('Draft loaded for editing.');
  }

  async function handleUpdateDraft(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    if (!editAdId) {
      setMessage('No draft selected for update.');
      return;
    }

    const response = await fetch(`/api/ads/${editAdId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        mediaUrl: editMediaUrl,
        thumbnailUrl: editThumbnailUrl,
        packageId: editPackageId,
      }),
    });
    const body = await response.json();
    if (response.ok) {
      setMessage('Draft updated successfully.');
      setEditAdId('');
      setEditTitle('');
      setEditDescription('');
      setEditMediaUrl('');
      setEditThumbnailUrl('');
      setEditPackageId('');
      setAds((prev) => prev.map((ad) => (ad.id === body.id ? body : ad)));
    } else {
      setMessage(body.error || 'Failed to update draft');
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-3xl font-semibold">User Dashboard</h2>
        <p className="mt-2 text-slate-400">Create a draft, submit payment proof, and track your ad workflow.</p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <form onSubmit={handleCreate} className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-semibold">Create Ad Draft</h3>
          <label className="block space-y-2 text-sm">
            <span>Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label className="block space-y-2 text-sm">
            <span>Description</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required />
          </label>
          <label className="block space-y-2 text-sm">
            <span>Media URL</span>
            <input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} type="url" required />
          </label>
          <label className="block space-y-2 text-sm">
            <span>Thumbnail URL</span>
            <input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} type="url" />
          </label>
          <label className="block space-y-2 text-sm">
            <span>Package</span>
            <select value={selectedPackage} onChange={(e) => setSelectedPackage(e.target.value)} required>
              <option value="">Select package</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} ({pkg.durationDays}d)
                </option>
              ))}
            </select>
          </label>
          <button className="w-full rounded bg-cyan-600 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-500">Create draft</button>
        </form>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-semibold">Submit Payment Proof</h3>
          <label className="block space-y-2 text-sm">
            <span>Ad ID</span>
            <input value={submitAdId} onChange={(e) => setSubmitAdId(e.target.value)} required />
          </label>
          <label className="block space-y-2 text-sm">
            <span>Transaction ID</span>
            <input value={transactionId} onChange={(e) => setTransactionId(e.target.value)} required />
          </label>
          <label className="block space-y-2 text-sm">
            <span>Proof URL (screenshot/external link)</span>
            <input value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} type="url" required />
          </label>
          <button className="w-full rounded bg-emerald-600 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-500">Submit ad</button>
        </form>
      </section>

      {editAdId ? (
        <form onSubmit={handleUpdateDraft} className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-semibold">Edit Draft</h3>
          <label className="block space-y-2 text-sm">
            <span>Title</span>
            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
          </label>
          <label className="block space-y-2 text-sm">
            <span>Description</span>
            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={4} required />
          </label>
          <label className="block space-y-2 text-sm">
            <span>Media URL</span>
            <input value={editMediaUrl} onChange={(e) => setEditMediaUrl(e.target.value)} type="url" required />
          </label>
          <label className="block space-y-2 text-sm">
            <span>Thumbnail URL</span>
            <input value={editThumbnailUrl} onChange={(e) => setEditThumbnailUrl(e.target.value)} type="url" />
          </label>
          <label className="block space-y-2 text-sm">
            <span>Package</span>
            <select value={editPackageId} onChange={(e) => setEditPackageId(e.target.value)} required>
              <option value="">Select package</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} ({pkg.durationDays}d)
                </option>
              ))}
            </select>
          </label>
          <button className="w-full rounded bg-amber-500 px-4 py-3 font-semibold text-slate-950 hover:bg-amber-400">Update draft</button>
        </form>
      ) : null}

      {message ? <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 text-slate-200">{message}</div> : null}

      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-xl font-semibold">My Ads</h3>
        <div className="mt-4 space-y-3">
          {ads.length === 0 ? (
            <p className="text-slate-400">No ads found. Create a draft to start.</p>
          ) : (
            ads.map((ad) => (
              <div key={ad.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm text-slate-400">{ad.package.name}</p>
                <p className="font-semibold text-slate-100">{ad.title}</p>
                <p className="text-sm text-slate-400">Status: {ad.status}</p>
                <p className="text-xs text-slate-500">Created {new Date(ad.createdAt).toLocaleString()}</p>
                {ad.status === 'DRAFT' ? (
                  <button
                    type="button"
                    onClick={() => selectDraft(ad)}
                    className="mt-3 inline-flex rounded bg-cyan-600 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-500"
                  >
                    Edit draft
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
