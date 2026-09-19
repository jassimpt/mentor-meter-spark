import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const schedules = await prisma.schedule.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'desc' },
  });
  const formattedSchedules = schedules.map(s => ({
    ...s,
    schedule_date: s.schedule_date.toISOString().split("T")[0],
    schedule_time: s.schedule_time.toISOString().split("T")[1].substring(0, 5)
  }));
  return NextResponse.json(formattedSchedules);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const schedule = await prisma.schedule.create({
    data: {
      ...body,
      user_id: user.id,
      schedule_date: new Date(body.schedule_date),
      schedule_time: new Date(`1970-01-01T${body.schedule_time}Z`),
    },
  });
  return NextResponse.json(schedule, { status: 201 });
}
