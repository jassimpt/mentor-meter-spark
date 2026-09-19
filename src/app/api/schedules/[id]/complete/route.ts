import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const schedule = await prisma.schedule.findUnique({ where: { id: id } });
  if (!schedule || schedule.user_id !== user.id) return NextResponse.json({ detail: 'Not found' }, { status: 404 });

  const { review_score } = await req.json();
  
  const updatedSchedule = await prisma.schedule.update({
    where: { id: id },
    data: { schedule_status: 'completed' },
  });

  const review = await prisma.review.create({
    data: {
      user_id: user.id,
      mentor_name: schedule.mentor_name,
      intern_name: schedule.intern_name,
      review_date: new Date(),
      review_topic: schedule.session_topic,
      review_score: review_score,
    },
  });

  return NextResponse.json({ schedule: updatedSchedule, review });
}
