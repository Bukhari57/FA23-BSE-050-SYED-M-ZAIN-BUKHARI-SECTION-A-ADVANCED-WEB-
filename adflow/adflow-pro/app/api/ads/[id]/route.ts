import prisma from '../../../../lib/prisma';
import { getCurrentUser, requireAuth } from '../../../../lib/auth';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const authUser = await getCurrentUser(request);
  requireAuth(authUser);

  const ad = await prisma.ad.findUnique({ where: { id: params.id } });
  if (!ad || ad.userId !== authUser!.id) {
    return new Response(JSON.stringify({ error: 'Ad not found or unauthorized' }), { status: 404 });
  }

  if (ad.status !== 'DRAFT') {
    return new Response(JSON.stringify({ error: 'Only draft ads may be updated' }), { status: 400 });
  }

  const body = await request.json();
  const { title, description, mediaUrl, thumbnailUrl, packageId } = body;
  const data: { title?: string; description?: string; mediaUrl?: string; thumbnailUrl?: string | null; packageId?: string } = {};

  if (title) data.title = title;
  if (description) data.description = description;
  if (mediaUrl) data.mediaUrl = mediaUrl;
  if (thumbnailUrl !== undefined) data.thumbnailUrl = thumbnailUrl || null;
  if (packageId) data.packageId = packageId;

  if (!Object.keys(data).length) {
    return new Response(JSON.stringify({ error: 'No fields to update' }), { status: 400 });
  }

  const updatedAd = await prisma.ad.update({
    where: { id: params.id },
    data,
    include: { package: true },
  });

  return new Response(JSON.stringify(updatedAd));
}
