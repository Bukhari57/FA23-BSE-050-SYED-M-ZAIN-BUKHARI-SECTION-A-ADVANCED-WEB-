import { redirect } from "next/navigation";
import type { UserRole } from "@/lib/types";
import { getCurrentUserProfile } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/constants";

export async function requireDashboardRole(allowed: UserRole[]) {
  const user = await getCurrentUserProfile();

  if (!user) {
    redirect("/explore");
  }

  if (!allowed.includes(user.role)) {
    redirect(ROLE_HOME[user.role] ?? "/");
  }

  return user;
}
