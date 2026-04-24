import prisma from '../../../../lib/prisma';
import { getCurrentUser, requireAuth, requireAnyRole } from '../../../../lib/auth';

export async function GET(request: Request) {
  const authUser = await getCurrentUser(request);
  requireAuth(authUser);
  requireAnyRole(authUser, ['ADMIN', 'SUPER_ADMIN']);

  const payments = await prisma.payment.findMany({
    where: { status: 'PENDING' },
    include: { ad: true },
    orderBy: { createdAt: 'asc' },
  });

  return new Response(JSON.stringify(payments));
}
