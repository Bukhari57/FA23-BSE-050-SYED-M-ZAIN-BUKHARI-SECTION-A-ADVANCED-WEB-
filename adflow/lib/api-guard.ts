import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export async function requireRole(roles: UserRole[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, blocked: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  const role = profile?.role as UserRole | undefined;

  if (!role || !roles.includes(role)) {
    return { supabase, user: null, blocked: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { supabase, user, role, blocked: null };
}

