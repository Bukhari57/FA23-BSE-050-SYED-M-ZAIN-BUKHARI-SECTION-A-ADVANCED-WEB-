export default function Input({ label, error, className = '', ...props }) {
  return (
    <label className="block text-sm font-medium text-[var(--text)]">
      {label && <span className="mb-2 block text-[var(--muted)]">{label}</span>}
      <input
        className={`w-full rounded-[1.25rem] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-soft),rgba(255,255,255,0.01))] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] ${className}`}
        {...props}
      />
      {error && <span className="mt-2 block text-xs text-[var(--danger)]">{error}</span>}
    </label>
  );
}
