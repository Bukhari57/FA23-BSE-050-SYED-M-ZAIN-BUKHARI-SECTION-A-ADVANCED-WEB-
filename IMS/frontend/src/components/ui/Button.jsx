export default function Button({ children, className = '', variant = 'primary', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-[1.25rem] px-5 py-3 text-sm font-semibold tracking-[0.01em] transition focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-50';
  const styles = {
    primary: 'bg-[linear-gradient(135deg,var(--accent-strong),var(--accent))] text-[#16110b] shadow-[0_18px_35px_rgba(199,164,106,0.24)] hover:-translate-y-0.5 hover:brightness-105',
    secondary: 'border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text)] hover:bg-[var(--surface-strong)]',
    outline: 'border border-[var(--accent-soft)] bg-transparent text-[var(--text)] hover:bg-[var(--accent-soft)]',
    ghost: 'bg-transparent text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]',
  };

  return (
    <button className={`${base} ${styles[variant] || styles.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}
