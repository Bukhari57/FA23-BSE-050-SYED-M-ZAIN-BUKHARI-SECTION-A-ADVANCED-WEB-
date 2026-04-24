import './global.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AdFlow Pro',
  description: 'Moderated ad marketplace with workflow automation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">AdFlow Pro</p>
              <h1 className="text-3xl font-semibold">Moderated marketplace workflow</h1>
            </div>
            <nav className="flex flex-wrap gap-3 text-slate-200">
              <a href="/" className="rounded bg-slate-800 px-3 py-2 hover:bg-slate-700">Home</a>
              <a href="/login" className="rounded bg-slate-800 px-3 py-2 hover:bg-slate-700">Login</a>
              <a href="/register" className="rounded bg-slate-800 px-3 py-2 hover:bg-slate-700">Register</a>
              <a href="/user" className="rounded bg-slate-800 px-3 py-2 hover:bg-slate-700">User</a>
              <a href="/moderator" className="rounded bg-slate-800 px-3 py-2 hover:bg-slate-700">Moderator</a>
              <a href="/admin" className="rounded bg-slate-800 px-3 py-2 hover:bg-slate-700">Admin</a>
              <a href="/super-admin" className="rounded bg-slate-800 px-3 py-2 hover:bg-slate-700">Super Admin</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
