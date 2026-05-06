import Link from "next/link";

const links = [
  { href: "/dashboard/client", label: "Client" },
  { href: "/dashboard/moderator", label: "Moderator" },
  { href: "/dashboard/admin", label: "Admin" },
  { href: "/dashboard/super-admin", label: "Super Admin" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="container py-8">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Role Dashboards</h2>
          <nav className="mt-3 space-y-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </main>
  );
}

