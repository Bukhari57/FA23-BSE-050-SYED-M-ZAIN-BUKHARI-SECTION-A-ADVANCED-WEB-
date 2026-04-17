export type UserRole = "client" | "moderator" | "admin" | "super_admin";

export type AdStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "payment_pending"
  | "payment_submitted"
  | "payment_verified"
  | "scheduled"
  | "published"
  | "expired"
  | "rejected";

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  cityId?: string | null;
  isSellerVerified: boolean;
  createdAt: string;
}

export interface Ad {
  id: string;
  clientId: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  cityId: string;
  packageId: string;
  status: AdStatus;
  featured: boolean;
  boostScore: number;
  publishedAt?: string | null;
  expiresAt?: string | null;
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdMedia {
  id: string;
  adId: string;
  mediaUrl: string;
  mediaType: "image" | "youtube";
  altText?: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface Package {
  id: string;
  name: string;
  pricePkr: number;
  weight: number;
  durationDays: number;
  isFeatured: boolean;
}

