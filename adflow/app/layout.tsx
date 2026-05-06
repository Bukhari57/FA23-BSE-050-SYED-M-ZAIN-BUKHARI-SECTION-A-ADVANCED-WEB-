import type { Metadata } from "next";
import "./globals.css";
import { TopNav } from "@/components/layout/top-nav";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "AdFlow Pro",
  description: "Sponsored listing marketplace with strict moderation lifecycle.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <AuthProvider>
          <TopNav />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

