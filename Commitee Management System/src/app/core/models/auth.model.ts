export type UserRole = 'super_admin' | 'admin' | 'manager' | 'member';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
  avatarUrl?: string;
  phone?: string;
  isEmailVerified: boolean;
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    dueReminders: boolean;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
