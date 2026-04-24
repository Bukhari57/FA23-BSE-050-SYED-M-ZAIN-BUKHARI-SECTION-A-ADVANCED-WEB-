'use client';

import { FormEvent, useEffect, useState } from 'react';

type Report = {
  totalUsers: number;
  totalAds: number;
  pendingPayments: number;
  statusCounts: Array<{ status: string; _count: { status: number } }>;
  packageCounts: Array<{ packageId: string; _count: { packageId: number } }>;
};

type Package = { id: string; name: string; price: number; durationDays: number; priority: number; featured: boolean };

type Setting = { id: string; key: string; value: string };

type UserView = { id: string; name: string; email: string; role: string };

export default function SuperAdminDashboard() {
  const [token, setToken] = useState('');
  const [reports, setReports] = useState<Report | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [users, setUsers] = useState<UserView[]>([]);
  const [newPackageName, setNewPackageName] = useState('');
  const [newPackagePrice, setNewPackagePrice] = useState('');
  const [newPackageDuration, setNewPackageDuration] = useState('');
  const [newPackagePriority, setNewPackagePriority] = useState('');
  const [newPackageFeatured, setNewPackageFeatured] = useState(false);
  const [newSettingKey, setNewSettingKey] = useState('');
  const [newSettingValue, setNewSettingValue] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('adflow-token');
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) return;

    fetch('/api/admin/reports', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setReports(data))
      .catch(() => setReports(null));

    fetch('/api/admin/packages', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setPackages(data))
      .catch(() => setPackages([]));

    fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => setSettings([]));

    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(() => setUsers([]));
  }, [token]);

  async function handlePackageCreate(event: FormEvent) {
    event.preventDefault();
    setMessage('');

    const response = await fetch('/api/admin/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: newPackageName,
        price: Number(newPackagePrice),
        durationDays: Number(newPackageDuration),
        priority: Number(newPackagePriority),
        featured: newPackageFeatured,
      }),
    });

    const body = await response.json();
    if (response.ok) {
      setPackages((prev) => [body, ...prev]);
      setNewPackageName('');
      setNewPackagePrice('');
      setNewPackageDuration('');
      setNewPackagePriority('');
      setNewPackageFeatured(false);
      setMessage('Package created successfully.');
    } else {
      setMessage(body.error || 'Failed to create package');
    }
  }

  async function handleSettingCreate(event: FormEvent) {
    event.preventDefault();
    setMessage('');

    const response = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ key: newSettingKey, value: newSettingValue }),
    });

    const body = await response.json();
    if (response.ok) {
      setSettings((prev) => [body, ...prev]);
      setNewSettingKey('');
      setNewSettingValue('');
      setMessage('Setting added successfully.');
    } else {
      setMessage(body.error || 'Failed to create setting');
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-3xl font-semibold">Super Admin Dashboard</h2>
        <p className="mt-2 text-slate-400">Manage packages, settings, and system reports from one place.</p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-semibold">System reports</h3>
          {reports ? (
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>Total users: {reports.totalUsers}</p>
              <p>Total ads: {reports.totalAds}</p>
              <p>Pending payments: {reports.pendingPayments}</p>
              <div>
                <p className="font-semibold">Ad statuses</p>
                <ul className="list-disc pl-5 text-slate-400">
                  {reports.statusCounts.map((statusCount) => (
                    <li key={statusCount.status}>
                      {statusCount.status}: {statusCount._count.status}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-slate-400">Loading reports...</p>
          )}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-semibold">Current packages</h3>
          <div className="mt-4 space-y-3">
            {packages.length === 0 ? (
              <p className="text-slate-400">No packages loaded.</p>
            ) : (
              packages.map((pkg) => (
                <div key={pkg.id} className="rounded-3xl border border-slate-700 bg-slate-950 p-4">
                  <p className="font-semibold text-slate-100">{pkg.name}</p>
                  <p className="text-sm text-slate-400">Price: ${pkg.price}</p>
                  <p className="text-sm text-slate-400">Duration: {pkg.durationDays} days</p>
                  <p className="text-sm text-slate-400">Priority: {pkg.priority}</p>
                  <p className="text-sm text-slate-400">Featured: {pkg.featured ? 'Yes' : 'No'}</p>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-xl font-semibold">Settings</h3>
        {settings.length === 0 ? (
          <p className="mt-4 text-slate-400">No settings available yet.</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {settings.map((setting) => (
              <div key={setting.id} className="rounded-3xl border border-slate-700 bg-slate-950 p-4">
                <p className="font-semibold text-slate-100">{setting.key}</p>
                <p className="text-slate-400">{setting.value}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-semibold">Create new package</h3>
          <form onSubmit={handlePackageCreate} className="mt-4 space-y-4">
            <label className="block space-y-2 text-sm">
              <span>Name</span>
              <input value={newPackageName} onChange={(e) => setNewPackageName(e.target.value)} required />
            </label>
            <label className="block space-y-2 text-sm">
              <span>Price</span>
              <input value={newPackagePrice} onChange={(e) => setNewPackagePrice(e.target.value)} type="number" required />
            </label>
            <label className="block space-y-2 text-sm">
              <span>Duration days</span>
              <input value={newPackageDuration} onChange={(e) => setNewPackageDuration(e.target.value)} type="number" required />
            </label>
            <label className="block space-y-2 text-sm">
              <span>Priority</span>
              <input value={newPackagePriority} onChange={(e) => setNewPackagePriority(e.target.value)} type="number" required />
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={newPackageFeatured} onChange={(e) => setNewPackageFeatured(e.target.checked)} />
              <span>Featured</span>
            </label>
            <button type="submit" className="w-full rounded bg-cyan-600 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-500">
              Create package
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-semibold">Create new setting</h3>
          <form onSubmit={handleSettingCreate} className="mt-4 space-y-4">
            <label className="block space-y-2 text-sm">
              <span>Setting key</span>
              <input value={newSettingKey} onChange={(e) => setNewSettingKey(e.target.value)} required />
            </label>
            <label className="block space-y-2 text-sm">
              <span>Value</span>
              <input value={newSettingValue} onChange={(e) => setNewSettingValue(e.target.value)} required />
            </label>
            <button type="submit" className="w-full rounded bg-emerald-600 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-500">
              Add setting
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-xl font-semibold">User management</h3>
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          {users.length === 0 ? (
            <p className="text-slate-400">No users found or you need to login.</p>
          ) : (
            users.map((user) => (
              <div key={user.id} className="rounded-3xl border border-slate-700 bg-slate-950 p-4">
                <p className="font-semibold text-slate-100">{user.name}</p>
                <p className="text-slate-400">{user.email}</p>
                <p className="text-slate-400">Role: {user.role}</p>
              </div>
            ))}
        </div>
      </section>

      {message ? <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 text-slate-200">{message}</div> : null}
    </div>
  );
}
