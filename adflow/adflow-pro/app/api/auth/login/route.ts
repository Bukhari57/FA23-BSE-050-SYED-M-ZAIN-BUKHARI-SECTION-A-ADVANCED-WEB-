import bcrypt from 'bcryptjs';
import prisma from '../../../../lib/prisma';
import { signToken, type Role } from '../../../../lib/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;
  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Missing credentials' }), { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role as Role, name: user.name });
  return new Response(JSON.stringify({ token }), { status: 200 });
}
