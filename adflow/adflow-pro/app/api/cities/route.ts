import prisma from '../../../lib/prisma';

export async function GET() {
  const cities = await prisma.ad.groupBy({
    by: ['city'],
    where: { city: { not: null } },
    orderBy: { city: 'asc' },
  });

  return new Response(JSON.stringify(cities.map((item) => item.city).filter(Boolean)));
}
