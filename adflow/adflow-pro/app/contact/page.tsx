export default function ContactPage() {
  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-4xl font-semibold text-slate-100">Contact</h1>
        <p className="mt-3 text-slate-400">Reach out for support, report suspicious ads, or ask about your account.</p>
      </section>
      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950 p-6 text-slate-300">
        <p>Email: <a href="mailto:support@adflowpro.dev" className="text-cyan-300 hover:underline">support@adflowpro.dev</a></p>
        <p>Phone: +1 (555) 010-2020</p>
        <p>Message: Use the contact form or email for fast support and ad reporting.</p>
      </section>
    </main>
  );
}
