import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/types";

export function assertRole(role: UserRole | undefined, allowed: UserRole[]) {
  if (!role || !allowed.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

export function isAdminRole(role: UserRole | undefined) {
  return role === "admin" || role === "super_admin";
}

