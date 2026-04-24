import prisma from '../../../../lib/prisma';
import { getCurrentUser, requireAuth, requireRole } from '../../../../lib/auth';

export async function GET(request: Request) {
  const authUser = await getCurrentUser(request);
  requireAuth(authUser);
  requireRole(authUser, 'MODERATOR');

  const ads = await prisma.ad.findMany({
    where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
    include: { package: true },
    orderBy: { createdAt: 'asc' },
  });

  return new Response(JSON.stringify(ads));
}
