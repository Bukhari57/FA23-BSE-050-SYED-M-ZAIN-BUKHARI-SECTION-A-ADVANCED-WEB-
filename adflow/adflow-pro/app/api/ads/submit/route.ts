import prisma from '../../../../lib/prisma';
import { getCurrentUser, requireAuth } from '../../../../lib/auth';

export async function POST(request: Request) {
  const authUser = await getCurrentUser(request);
  requireAuth(authUser);

  const body = await request.json();
  const { adId, transactionId, proofUrl } = body;
  if (!adId || !transactionId || !proofUrl) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  }

  const ad = await prisma.ad.findUnique({ where: { id: adId } });
  if (!ad || ad.userId !== authUser!.id) {
    return new Response(JSON.stringify({ error: 'Ad not found or unauthorized' }), { status: 404 });
  }
  if (ad.status !== 'DRAFT') {
    return new Response(JSON.stringify({ error: 'Only draft ads may be submitted' }), { status: 400 });
  }

  const payment = await prisma.payment.create({
    data: {
      adId,
      transactionId,
      proofUrl,
      status: 'PENDING',
    },
  });

  const updatedAd = await prisma.ad.update({
    where: { id: adId },
    data: { status: 'SUBMITTED' },
    include: { package: true },
  });

  return new Response(JSON.stringify({ ...updatedAd, payment }), { status: 200 });
}
