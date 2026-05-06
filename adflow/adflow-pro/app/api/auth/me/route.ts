import { getCurrentUser, requireAuth } from '../../../../lib/auth';

export async function GET(request: Request) {
  const authUser = await getCurrentUser(request);
  requireAuth(authUser);
  return new Response(JSON.stringify(authUser), { status: 200 });
}
