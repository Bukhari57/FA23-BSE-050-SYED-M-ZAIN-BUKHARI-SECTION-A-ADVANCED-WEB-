import prisma from '../../../lib/prisma';
import { getCurrentUser, requireAuth } from '../../../lib/auth';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mine = url.searchParams.get('mine');
  const publicFeed = url.searchParams.get('public');
  const authUser = await getCurrentUser(request);

  if (mine === 'true') {
    requireAuth(authUser);
    const ads = await prisma.ad.findMany({
      where: { userId: authUser!.id },
      include: { package: true },
      orderBy: { createdAt: 'desc' },
    });
    return new Response(JSON.stringify(ads));
  }

  if (publicFeed === 'true') {
    const now = new Date();
    const ads = await prisma.ad.findMany({
      where: {
        status: 'LIVE',
        startDate: { lte: now },
        endDate: { gt: now },
      },
      include: { package: true, user: true },
      orderBy: [
        { package: { priority: 'desc' } },
        { featured: 'desc' },
        { startDate: 'desc' },
      ],
    });
    return new Response(JSON.stringify(ads));
  }

  return new Response(JSON.stringify({ error: 'Invalid query param' }), { status: 400 });
}

export async function POST(request: Request) {
  const authUser = await getCurrentUser(request);
  requireAuth(authUser);
  if (authUser!.role !== 'USER') {
    return new Response(JSON.stringify({ error: 'Only clients can create ads' }), { status: 403 });
  }

  const body = await request.json();
  const { title, description, mediaUrl, thumbnailUrl, packageId } = body;
  if (!title || !description || !mediaUrl || !packageId) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  }

  const ad = await prisma.ad.create({
    data: {
      title,
      description,
      mediaUrl,
      thumbnailUrl: thumbnailUrl || null,
      packageId,
      userId: authUser!.id,
      status: 'DRAFT',
    },
    include: { package: true },
  });

  return new Response(JSON.stringify(ad), { status: 201 });
}
