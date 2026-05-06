import prisma from '../../../../../lib/prisma';
import { getCurrentUser, requireAnyRole, requireAuth } from '../../../../../lib/auth';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const authUser = await getCurrentUser(request);
  requireAuth(authUser);
  requireAnyRole(authUser, ['SUPER_ADMIN']);

  const body = await request.json();
  const { value } = body;
  if (value == null) {
    return new Response(JSON.stringify({ error: 'Missing value field' }), { status: 400 });
  }

  const updatedSetting = await prisma.setting.update({
    where: { id: params.id },
    data: { value },
  });

  return new Response(JSON.stringify(updatedSetting));
}
