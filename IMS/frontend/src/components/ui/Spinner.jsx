export default function Spinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-[var(--surface-strong)] border-t-[var(--accent)]" />
    </div>
  );
}
