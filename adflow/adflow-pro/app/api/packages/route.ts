export const dynamic = 'force-dynamic';

import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const packages = await prisma.package.findMany({ orderBy: { priority: 'desc' } });
    return new Response(JSON.stringify(packages));
  } catch (error) {
    console.error('Package fetch error:', error);
    return new Response(JSON.stringify({
      error: 'Database unavailable. Check your Supabase POSTGRES URL in DATABASE_URL.',
    }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }
}
