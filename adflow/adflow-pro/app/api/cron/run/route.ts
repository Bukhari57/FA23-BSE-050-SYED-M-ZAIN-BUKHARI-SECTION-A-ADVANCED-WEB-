import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  const now = new Date();

  const approvedAds = await prisma.ad.findMany({
    where: { status: 'APPROVED' },
    include: { package: true },
  });

  for (const ad of approvedAds) {
    const startDate = now;
    const endDate = new Date(now.getTime() + ad.package.durationDays * 24 * 60 * 60 * 1000);
    await prisma.ad.update({
      where: { id: ad.id },
      data: { status: 'SCHEDULED', startDate, endDate },
    });
  }

  await prisma.ad.updateMany({ where: { status: 'SCHEDULED', startDate: { lte: now } }, data: { status: 'LIVE' } });
  await prisma.ad.updateMany({ where: { status: 'LIVE', endDate: { lte: now } }, data: { status: 'EXPIRED' } });

  return new Response(JSON.stringify({ success: true }));
}
