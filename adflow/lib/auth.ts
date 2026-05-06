import { createClient } from "@/lib/supabase/server";
import type { AppUser, UserRole } from "@/lib/types";

export async function getCurrentUserProfile(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("users")
    .select("id, email, full_name, role, city_id, is_seller_verified, created_at")
    .eq("id", user.id)
    .single();

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    role: data.role,
    cityId: data.city_id,
    isSellerVerified: data.is_seller_verified,
    createdAt: data.created_at,
  };
}

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]) {
  return allowedRoles.includes(userRole);
}

