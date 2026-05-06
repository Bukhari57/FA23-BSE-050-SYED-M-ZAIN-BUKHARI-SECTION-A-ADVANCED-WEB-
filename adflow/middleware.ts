import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const roleRoutes: Record<string, string[]> = {
  "/dashboard/client": ["client", "super_admin"],
  "/dashboard/moderator": ["moderator", "admin", "super_admin"],
  "/dashboard/admin": ["admin", "super_admin"],
  "/dashboard/super-admin": ["super_admin"],
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, {
              ...options,
            }),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/explore", req.url));
    }

    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
    const allowed = roleRoutes[req.nextUrl.pathname] ?? ["client", "moderator", "admin", "super_admin"];

    if (!profile?.role || !allowed.includes(profile.role)) {
      return NextResponse.redirect(new URL("/dashboard/client", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
