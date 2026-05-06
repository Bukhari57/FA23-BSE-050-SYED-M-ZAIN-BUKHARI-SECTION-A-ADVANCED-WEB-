import prisma from '../../../../lib/prisma';
import { getCurrentUser, requireAnyRole, requireAuth } from '../../../../lib/auth';

export async function GET(request: Request) {
  const authUser = await getCurrentUser(request);
  requireAuth(authUser);
  requireAnyRole(authUser, ['SUPER_ADMIN']);

  const packages = await prisma.package.findMany({ orderBy: { priority: 'desc' } });
  return new Response(JSON.stringify(packages));
}

export async function POST(request: Request) {
  const authUser = await getCurrentUser(request);
  requireAuth(authUser);
  requireAnyRole(authUser, ['SUPER_ADMIN']);

  const body = await request.json();
  const { name, price, durationDays, priority, featured } = body;
  if (!name || price == null || durationDays == null || priority == null) {
    return new Response(JSON.stringify({ error: 'Missing package fields' }), { status: 400 });
  }

  const pkg = await prisma.package.create({
    data: {
      name,
      price,
      durationDays,
      priority,
      featured: !!featured,
    },
  });

  return new Response(JSON.stringify(pkg), { status: 201 });
}
