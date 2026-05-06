import prisma from '../../../lib/prisma';

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return new Response(JSON.stringify(categories));
}
