import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, createAccessToken, createRefreshToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const { refresh_token } = await req.json();

    const payload = verifyToken(refresh_token);
    if (!payload || payload.type !== 'refresh') {
      return NextResponse.json({ detail: 'Invalid or expired refresh token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return NextResponse.json({ detail: 'User no longer exists' }, { status: 401 });
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
