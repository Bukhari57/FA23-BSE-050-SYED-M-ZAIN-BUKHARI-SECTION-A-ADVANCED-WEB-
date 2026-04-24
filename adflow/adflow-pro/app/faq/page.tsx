export default function FAQPage() {
  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-4xl font-semibold text-slate-100">FAQ</h1>
        <p className="mt-3 text-slate-400">Frequently asked questions about creating ads, packages, and moderation.</p>
      </section>
      <section className="space-y-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="text-xl font-semibold text-slate-100">How do I submit an ad?</h2>
          <p className="mt-2 text-slate-300">Create a draft, choose a package, and provide proof of payment to submit your ad for review.</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="text-xl font-semibold text-slate-100">What happens after submission?</h2>
          <p className="mt-2 text-slate-300">A moderator verifies the payment proof and ad content before the listing goes live.</p>
        </div>
      </section>
    </main>
  );
}
