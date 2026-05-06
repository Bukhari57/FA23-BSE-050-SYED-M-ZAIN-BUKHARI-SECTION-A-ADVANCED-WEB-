export const APP_NAME = "AdFlow Pro";

export const AD_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "payment_pending",
  "payment_submitted",
  "payment_verified",
  "scheduled",
  "published",
  "expired",
  "rejected",
] as const;

export const DEFAULT_PAGE_SIZE = 12;

export const PLACEHOLDER_IMAGE = "https://placehold.co/1200x800?text=AdFlow+Pro";

export const ROLE_HOME: Record<string, string> = {
  client: "/dashboard/client",
  moderator: "/dashboard/moderator",
  admin: "/dashboard/admin",
  super_admin: "/dashboard/super-admin",
};

