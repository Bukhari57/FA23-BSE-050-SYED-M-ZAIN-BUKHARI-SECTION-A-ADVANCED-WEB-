import { Moon, SunMedium, Menu } from 'lucide-react';

export default function Topbar({ theme, setTheme, onMobileMenuToggle }) {
  return (
    <div className="premium-panel flex flex-col gap-4 rounded-[1.75rem] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <button
          className="inline-flex items-center gap-2 rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-[var(--text)] hover:bg-[var(--surface-strong)] lg:hidden"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Executive view</p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">Inventory overview</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">A cleaner, warmer workspace for stock control, reporting, and daily operations.</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--muted)] sm:inline-flex">
          Live operations
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-strong)]"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
      </div>
    </div>
  );
}
