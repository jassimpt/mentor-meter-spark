import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const review = await prisma.review.findUnique({ where: { id: id } });
  if (!review || review.user_id !== user.id) return NextResponse.json({ detail: 'Not found' }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.review.update({
    where: { id: id },
    data: {
      ...body,
      review_date: body.review_date ? new Date(body.review_date) : undefined,
    },
  });
  return NextResponse.json({
    ...updated,
    review_date: updated.review_date.toISOString().split("T")[0]
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const review = await prisma.review.findUnique({ where: { id: id } });
  if (!review || review.user_id !== user.id) return NextResponse.json({ detail: 'Not found' }, { status: 404 });

  await prisma.review.delete({ where: { id: id } });
  return NextResponse.json({ message: 'Review deleted successfully' });
}
