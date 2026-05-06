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
      include: { package: true, category: true },
      orderBy: { createdAt: 'desc' },
    });
    return new Response(JSON.stringify(ads));
  }

  if (publicFeed === 'true') {
    const now = new Date();
    const search = url.searchParams.get('search')?.trim();
    const category = url.searchParams.get('category')?.trim();
    const city = url.searchParams.get('city')?.trim();
    const sort = url.searchParams.get('sort');
    const page = Math.max(Number(url.searchParams.get('page') || '1'), 1);
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || '12'), 1), 50);
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'LIVE',
      startDate: { lte: now },
      endDate: { gt: now },
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = { name: { equals: category, mode: 'insensitive' } };
    }

    if (city) {
      where.city = { equals: city, mode: 'insensitive' };
    }

    const orderBy =
      sort === 'newest'
        ? [{ startDate: 'desc' }]
        : sort === 'featured'
        ? [{ featured: 'desc' }, { package: { priority: 'desc' } }, { startDate: 'desc' }]
        : [{ package: { priority: 'desc' } }, { featured: 'desc' }, { startDate: 'desc' }];

    const [total, ads] = await Promise.all([
      prisma.ad.count({ where }),
      prisma.ad.findMany({
        where,
        include: { package: true, user: true, category: true },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    return new Response(JSON.stringify({ ads, total, page, limit }));
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
  const { title, description, mediaUrl, thumbnailUrl, packageId, categoryId, city } = body;
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
      categoryId: categoryId || undefined,
      city: city?.trim() || undefined,
      userId: authUser!.id,
      status: 'DRAFT',
    },
    include: { package: true, category: true },
  });

  return new Response(JSON.stringify(ad), { status: 201 });
}
