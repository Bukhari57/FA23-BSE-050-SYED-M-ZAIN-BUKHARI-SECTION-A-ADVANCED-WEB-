import { motion } from 'framer-motion';

export default function Modal({ open, title, children, footer, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07080c]/70 p-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        className="premium-panel w-full max-w-2xl rounded-[2rem] p-6"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Workspace editor</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--text-strong)]">{title}</h2>
          </div>
          <button className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-strong)]" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="space-y-4">{children}</div>
        {footer && <div className="mt-6">{footer}</div>}
      </motion.div>
    </div>
  );
}
