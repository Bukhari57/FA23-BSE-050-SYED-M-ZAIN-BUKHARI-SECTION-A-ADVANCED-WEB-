export default function GlobalLoading() {
  return (
    <div className="container py-20">
      <div className="h-12 w-64 animate-pulse rounded-lg bg-slate-200" />
      <div className="mt-4 h-6 w-full animate-pulse rounded bg-slate-100" />
      <div className="mt-2 h-6 w-2/3 animate-pulse rounded bg-slate-100" />
    </div>
  );
}

