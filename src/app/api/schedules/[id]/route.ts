import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const schedule = await prisma.schedule.findUnique({ where: { id: id } });
  if (!schedule || schedule.user_id !== user.id) return NextResponse.json({ detail: 'Not found' }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.schedule.update({
    where: { id: id },
    data: {
      ...body,
      schedule_date: body.schedule_date ? new Date(body.schedule_date) : undefined,
      schedule_time: body.schedule_time ? new Date(`1970-01-01T${body.schedule_time}Z`) : undefined,
    },
  });
  return NextResponse.json({
    ...updated,
    schedule_date: updated.schedule_date.toISOString().split("T")[0],
    schedule_time: updated.schedule_time.toISOString().split("T")[1].substring(0, 5)
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const schedule = await prisma.schedule.findUnique({ where: { id: id } });
  if (!schedule || schedule.user_id !== user.id) return NextResponse.json({ detail: 'Not found' }, { status: 404 });

  await prisma.schedule.delete({ where: { id: id } });
  return NextResponse.json({ message: 'Schedule deleted successfully' });
}
