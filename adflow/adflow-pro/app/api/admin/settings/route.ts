import prisma from '../../../../lib/prisma';
import { getCurrentUser, requireAnyRole, requireAuth } from '../../../../lib/auth';

export async function GET(request: Request) {
  const authUser = await getCurrentUser(request);
  requireAuth(authUser);
  requireAnyRole(authUser, ['SUPER_ADMIN']);

  const settings = await prisma.setting.findMany({ orderBy: { key: 'asc' } });
  return new Response(JSON.stringify(settings));
}

export async function POST(request: Request) {
  const authUser = await getCurrentUser(request);
  requireAuth(authUser);
  requireAnyRole(authUser, ['SUPER_ADMIN']);

  const body = await request.json();
  const { key, value } = body;
  if (!key || value == null) {
    return new Response(JSON.stringify({ error: 'Missing setting fields' }), { status: 400 });
  }

  const setting = await prisma.setting.create({
    data: { key, value },
  });

  return new Response(JSON.stringify(setting), { status: 201 });
}
