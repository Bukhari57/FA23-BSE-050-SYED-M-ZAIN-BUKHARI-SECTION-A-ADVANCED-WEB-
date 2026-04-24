import prisma from '../../../../../lib/prisma';
import { getCurrentUser, requireAnyRole, requireAuth } from '../../../../../lib/auth';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const authUser = await getCurrentUser(request);
  requireAuth(authUser);
  requireAnyRole(authUser, ['ADMIN', 'SUPER_ADMIN']);

  const body = await request.json();
  const { featured, status, startDate, endDate } = body;
  const data: { featured?: boolean; status?: string; startDate?: Date | null; endDate?: Date | null } = {};

  if (featured != null) data.featured = !!featured;
  if (status) {
    if (!['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'SCHEDULED', 'LIVE', 'EXPIRED', 'REJECTED'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid status' }), { status: 400 });
    }
    data.status = status;
  }
  if (startDate !== undefined) {
    data.startDate = startDate ? new Date(startDate) : null;
  }
  if (endDate !== undefined) {
    data.endDate = endDate ? new Date(endDate) : null;
  }

  if (!Object.keys(data).length) {
    return new Response(JSON.stringify({ error: 'No update fields provided' }), { status: 400 });
  }

  const updatedAd = await prisma.ad.update({ where: { id: params.id }, data });
  return new Response(JSON.stringify(updatedAd));
}
