import prisma from '../../../../lib/prisma';
import { getCurrentUser, requireAnyRole, requireAuth } from '../../../../lib/auth';

export async function GET(request: Request) {
  const authUser = await getCurrentUser(request);
  requireAuth(authUser);
  requireAnyRole(authUser, ['ADMIN', 'SUPER_ADMIN']);

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  return new Response(JSON.stringify(users));
}
