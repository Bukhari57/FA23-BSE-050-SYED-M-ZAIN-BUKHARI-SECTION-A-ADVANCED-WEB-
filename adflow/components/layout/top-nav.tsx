"use client";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";

const links = [
  { href: "/explore", label: "Explore" },
  { href: "/packages", label: "Packages" },
  { href: "/dashboard/client", label: "Dashboard" },
];

export function TopNav() {
  const { user, loading, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-slate-900">
          {APP_NAME}
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
              {link.label}
            </Link>
          ))}
          {!loading && user ? (
            <>
              <span className="px-2 text-sm text-slate-700">{user.email}</span>
              <Button size="sm" variant="secondary" onClick={signOut}>Sign Out</Button>
            </>
          ) : (
            <>
              <Link href="/signin">
                <Button size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" variant="secondary">Sign Up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

