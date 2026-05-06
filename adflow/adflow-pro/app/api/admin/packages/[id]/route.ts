import prisma from '../../../../../lib/prisma';
import { getCurrentUser, requireAnyRole, requireAuth } from '../../../../../lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const authUser = await getCurrentUser(request);
  requireAuth(authUser);
  requireAnyRole(authUser, ['SUPER_ADMIN']);

  const pkg = await prisma.package.findUnique({ where: { id: params.id } });
  if (!pkg) {
    return new Response(JSON.stringify({ error: 'Package not found' }), { status: 404 });
  }

  return new Response(JSON.stringify(pkg));
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const authUser = await getCurrentUser(request);
  requireAuth(authUser);
  requireAnyRole(authUser, ['SUPER_ADMIN']);

  const body = await request.json();
  const { name, price, durationDays, priority, featured } = body;
  const data: { name?: string; price?: number; durationDays?: number; priority?: number; featured?: boolean } = {};

  if (name) data.name = name;
  if (price != null) data.price = price;
  if (durationDays != null) data.durationDays = durationDays;
  if (priority != null) data.priority = priority;
  if (featured != null) data.featured = !!featured;

  if (!Object.keys(data).length) {
    return new Response(JSON.stringify({ error: 'No update fields provided' }), { status: 400 });
  }

  const updatedPackage = await prisma.package.update({ where: { id: params.id }, data });
  return new Response(JSON.stringify(updatedPackage));
}
