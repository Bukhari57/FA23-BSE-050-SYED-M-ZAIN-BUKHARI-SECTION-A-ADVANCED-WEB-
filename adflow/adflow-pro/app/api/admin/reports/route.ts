import prisma from '../../../../lib/prisma';
import { getCurrentUser, requireAnyRole, requireAuth } from '../../../../lib/auth';

export async function GET(request: Request) {
  const authUser = await getCurrentUser(request);
  requireAuth(authUser);
  requireAnyRole(authUser, ['ADMIN', 'SUPER_ADMIN']);

  const totalUsers = await prisma.user.count();
  const totalAds = await prisma.ad.count();
  const pendingPayments = await prisma.payment.count({ where: { status: 'PENDING' } });
  const statusCounts = await prisma.ad.groupBy({
    by: ['status'],
    _count: { status: true },
  });
  const packageCounts = await prisma.ad.groupBy({
    by: ['packageId'],
    _count: { packageId: true },
  });

  return new Response(JSON.stringify({
    totalUsers,
    totalAds,
    pendingPayments,
    statusCounts,
    packageCounts,
  }));
}
