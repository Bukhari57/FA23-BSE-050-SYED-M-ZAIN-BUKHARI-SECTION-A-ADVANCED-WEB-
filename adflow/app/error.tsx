"use client";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <div className="container py-16">
      <h2 className="text-2xl font-semibold text-rose-700">Something went wrong</h2>
      <p className="mt-2 text-slate-700">{error.message}</p>
    </div>
  );
}

