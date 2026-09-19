import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const reviews = await prisma.review.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'desc' },
  });
  const formattedReviews = reviews.map(r => ({
    ...r,
    review_date: r.review_date.toISOString().split("T")[0]
  }));
  return NextResponse.json(formattedReviews);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const review = await prisma.review.create({
    data: {
      ...body,
      user_id: user.id,
      review_date: new Date(body.review_date),
    },
  });
  return NextResponse.json(review, { status: 201 });
}
