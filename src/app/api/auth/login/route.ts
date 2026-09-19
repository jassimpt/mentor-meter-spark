import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAccessToken, createRefreshToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.hashed_password))) {
      return NextResponse.json({ detail: 'Invalid email or password' }, { status: 401 });
    }

    return NextResponse.json(
      {
        access_token: createAccessToken(user.id),
        refresh_token: createRefreshToken(user.id),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
