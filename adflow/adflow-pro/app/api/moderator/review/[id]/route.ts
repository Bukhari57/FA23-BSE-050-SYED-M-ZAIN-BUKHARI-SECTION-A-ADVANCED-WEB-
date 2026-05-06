import prisma from '../../../../../lib/prisma';
import { getCurrentUser, requireAuth, requireRole } from '../../../../../lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const authUser = await getCurrentUser(request);
  requireAuth(authUser);
  requireRole(authUser, 'MODERATOR');

  const { id } = params;
  const body = await request.json();
  const { decision, feedback, internalNotes, suspiciousMedia } = body;
  if (!decision || !['APPROVED', 'REJECTED'].includes(decision)) {
    return new Response(JSON.stringify({ error: 'Decision must be APPROVED or REJECTED' }), { status: 400 });
  }

  const ad = await prisma.ad.findUnique({ where: { id } });
  if (!ad || !['SUBMITTED', 'UNDER_REVIEW'].includes(ad.status)) {
    return new Response(JSON.stringify({ error: 'Ad not eligible for review' }), { status: 400 });
  }

  const updatedAd = await prisma.ad.update({
    where: { id },
    data: {
      status: decision === 'APPROVED' ? 'APPROVED' : 'REJECTED',
      suspiciousMedia: suspiciousMedia === true,
      reviews: {
        create: {
          moderatorId: authUser!.id,
          decision,
          feedback: feedback || '',
          internalNotes: internalNotes || '',
        },
      },
    },
  });

  return new Response(JSON.stringify(updatedAd));
}
