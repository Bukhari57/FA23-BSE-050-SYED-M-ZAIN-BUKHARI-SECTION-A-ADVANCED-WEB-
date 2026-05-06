import prisma from '../../../../../../lib/prisma';
import { getCurrentUser, requireAuth, requireAnyRole } from '../../../../../../lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const authUser = await getCurrentUser(request);
  requireAuth(authUser);
  requireAnyRole(authUser, ['ADMIN', 'SUPER_ADMIN']);

  const { id } = params;
  const body = await request.json();
  const { action, featured, startDate, endDate } = body;
  if (!['approve', 'reject'].includes(action)) {
    return new Response(JSON.stringify({ error: 'Action must be approve or reject' }), { status: 400 });
  }

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { ad: { include: { package: true } } },
  });
  if (!payment || payment.status !== 'PENDING') {
    return new Response(JSON.stringify({ error: 'Payment not found or already processed' }), { status: 404 });
  }

  if (action === 'reject') {
    await prisma.payment.update({ where: { id }, data: { status: 'REJECTED' } });
    await prisma.ad.update({ where: { id: payment.adId }, data: { status: 'REJECTED' } });
    return new Response(JSON.stringify({ success: true }));
  }

  const now = new Date();
  const end = endDate ? new Date(endDate) : new Date(now.getTime() + payment.ad.package.durationDays * 24 * 60 * 60 * 1000);
  const start = startDate ? new Date(startDate) : now;

  await prisma.payment.update({ where: { id }, data: { status: 'APPROVED' } });
  await prisma.ad.update({
    where: { id: payment.adId },
    data: {
      status: 'SCHEDULED',
      startDate: start,
      endDate: end,
      featured: featured === true,
    },
  });

  return new Response(JSON.stringify({ success: true }));
}
