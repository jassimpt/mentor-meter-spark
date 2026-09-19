import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const schedule = await prisma.schedule.findUnique({ where: { id: id } });
  if (!schedule || schedule.user_id !== user.id) return NextResponse.json({ detail: 'Not found' }, { status: 404 });

  const { status } = await req.json();
  const updated = await prisma.schedule.update({
    where: { id: id },
    data: { schedule_status: status },
  });
  return NextResponse.json({
    ...updated,
    schedule_date: updated.schedule_date.toISOString().split("T")[0],
    schedule_time: updated.schedule_time.toISOString().split("T")[1].substring(0, 5)
  });
}
