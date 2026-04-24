import bcrypt from 'bcryptjs';
import prisma from '../../../../lib/prisma';
import { signToken, type Role } from '../../../../lib/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password } = body;
  if (!name || !email || !password) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return new Response(JSON.stringify({ error: 'Email already registered' }), { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: 'USER',
    },
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role as Role, name: user.name });
  return new Response(JSON.stringify({ token }), { status: 201 });
}
