import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'adflow-secret-token';

export type Role = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  name: string;
};

export function signToken(user: AuthUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch (_err) {
    return null;
  }
}

export async function getCurrentUser(request: Request): Promise<AuthUser | null> {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const payload = verifyToken(token);
  if (!payload) return null;
  const user = await prisma.user.findUnique({
    where: { id: payload.id },
  });
  if (!user) return null;
  return { id: user.id, email: user.email, role: user.role as Role, name: user.name };
}

export function requireAuth(user: AuthUser | null) {
  if (!user) {
    throw new Error('Unauthorized');
  }
}

export function requireRole(user: AuthUser | null, role: Role) {
  if (!user || user.role !== role) {
    throw new Error('Forbidden');
  }
}

export function requireAnyRole(user: AuthUser | null, roles: Role[]) {
  if (!user || !roles.includes(user.role)) {
    throw new Error('Forbidden');
  }
}
