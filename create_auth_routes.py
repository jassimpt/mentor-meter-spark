import os

register_code = """import { NextResponse } from 'next/server';
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
"""

login_code = """import { NextResponse } from 'next/server';
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
"""

refresh_code = """import { NextResponse } from 'next/server';
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
"""

os.makedirs('src/app/api/auth/register', exist_ok=True)
os.makedirs('src/app/api/auth/login', exist_ok=True)
os.makedirs('src/app/api/auth/refresh', exist_ok=True)

with open('src/app/api/auth/register/route.ts', 'w') as f: f.write(register_code)
with open('src/app/api/auth/login/route.ts', 'w') as f: f.write(login_code)
with open('src/app/api/auth/refresh/route.ts', 'w') as f: f.write(refresh_code)
