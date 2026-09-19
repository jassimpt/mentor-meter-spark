import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAccessToken, createRefreshToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const { email, password, full_name } = await req.json();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ detail: 'An account with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        full_name,
        hashed_password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        access_token: createAccessToken(user.id),
        refresh_token: createRefreshToken(user.id),
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
