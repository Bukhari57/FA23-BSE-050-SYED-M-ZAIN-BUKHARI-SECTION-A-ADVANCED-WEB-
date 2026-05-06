import prisma from '../../../../../lib/prisma';
import { getCurrentUser, requireAnyRole, requireAuth } from '../../../../../lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const authUser = await getCurrentUser(request);
  requireAuth(authUser);
  requireAnyRole(authUser, ['ADMIN', 'SUPER_ADMIN']);

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
  }

  return new Response(JSON.stringify(user));
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const authUser = await getCurrentUser(request);
  requireAuth(authUser);
  requireAnyRole(authUser, ['ADMIN', 'SUPER_ADMIN']);
  const user = authUser!;

  const body = await request.json();
  const { name, role } = body;
  const data: { name?: string; role?: string } = {};

  if (name) data.name = name;
  if (role) {
    if (user.role !== 'SUPER_ADMIN') {
      return new Response(JSON.stringify({ error: 'Only super admin can change roles' }), { status: 403 });
    }
    if (!['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return new Response(JSON.stringify({ error: 'Invalid role' }), { status: 400 });
    }
    data.role = role;
  }

  if (!Object.keys(data).length) {
    return new Response(JSON.stringify({ error: 'No update fields provided' }), { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return new Response(JSON.stringify(updatedUser));
}
