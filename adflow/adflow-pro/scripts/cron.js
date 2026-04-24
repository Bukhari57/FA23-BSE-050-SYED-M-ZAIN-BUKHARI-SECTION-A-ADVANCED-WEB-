const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const now = new Date();

  const approvedAds = await prisma.ad.findMany({
    where: {
      status: 'APPROVED',
    },
    include: { package: true },
  });

  for (const ad of approvedAds) {
    const startDate = now;
    const endDate = new Date(now.getTime() + ad.package.durationDays * 24 * 60 * 60 * 1000);
    await prisma.ad.update({
      where: { id: ad.id },
      data: {
        status: 'SCHEDULED',
        startDate,
        endDate,
      },
    });
  }

  await prisma.ad.updateMany({
    where: {
      status: 'SCHEDULED',
      startDate: { lte: now },
    },
    data: { status: 'LIVE' },
  });

  await prisma.ad.updateMany({
    where: {
      status: 'LIVE',
      endDate: { lte: now },
    },
    data: { status: 'EXPIRED' },
  });

  const staleAds = await prisma.ad.findMany({
    where: {
      status: 'SUBMITTED',
      createdAt: { lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
    },
  });
  for (const ad of staleAds) {
    await prisma.ad.update({
      where: { id: ad.id },
      data: { status: 'REJECTED' },
    });
  }

  console.log('Cron run complete');
}

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
