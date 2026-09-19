import os

reviews_route = """import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const reviews = await prisma.review.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'desc' },
  });
  return NextResponse.json(reviews);
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
"""

review_id_route = """import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const review = await prisma.review.findUnique({ where: { id: params.id } });
  if (!review || review.user_id !== user.id) return NextResponse.json({ detail: 'Not found' }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.review.update({
    where: { id: params.id },
    data: {
      ...body,
      review_date: body.review_date ? new Date(body.review_date) : undefined,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const review = await prisma.review.findUnique({ where: { id: params.id } });
  if (!review || review.user_id !== user.id) return NextResponse.json({ detail: 'Not found' }, { status: 404 });

  await prisma.review.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Review deleted successfully' });
}
"""

schedules_route = """import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const schedules = await prisma.schedule.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'desc' },
  });
  return NextResponse.json(schedules);
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
"""

schedule_id_route = """import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const schedule = await prisma.schedule.findUnique({ where: { id: params.id } });
  if (!schedule || schedule.user_id !== user.id) return NextResponse.json({ detail: 'Not found' }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.schedule.update({
    where: { id: params.id },
    data: {
      ...body,
      schedule_date: body.schedule_date ? new Date(body.schedule_date) : undefined,
      schedule_time: body.schedule_time ? new Date(`1970-01-01T${body.schedule_time}Z`) : undefined,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const schedule = await prisma.schedule.findUnique({ where: { id: params.id } });
  if (!schedule || schedule.user_id !== user.id) return NextResponse.json({ detail: 'Not found' }, { status: 404 });

  await prisma.schedule.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Schedule deleted successfully' });
}
"""

schedule_status_route = """import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const schedule = await prisma.schedule.findUnique({ where: { id: params.id } });
  if (!schedule || schedule.user_id !== user.id) return NextResponse.json({ detail: 'Not found' }, { status: 404 });

  const { status } = await req.json();
  const updated = await prisma.schedule.update({
    where: { id: params.id },
    data: { schedule_status: status },
  });
  return NextResponse.json(updated);
}
"""

schedule_complete_route = """import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const schedule = await prisma.schedule.findUnique({ where: { id: params.id } });
  if (!schedule || schedule.user_id !== user.id) return NextResponse.json({ detail: 'Not found' }, { status: 404 });

  const { review_score } = await req.json();
  
  const updatedSchedule = await prisma.schedule.update({
    where: { id: params.id },
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
"""

os.makedirs('src/app/api/reviews/[id]', exist_ok=True)
os.makedirs('src/app/api/schedules/[id]/status', exist_ok=True)
os.makedirs('src/app/api/schedules/[id]/complete', exist_ok=True)

with open('src/app/api/reviews/route.ts', 'w') as f: f.write(reviews_route)
with open('src/app/api/reviews/[id]/route.ts', 'w') as f: f.write(review_id_route)
with open('src/app/api/schedules/route.ts', 'w') as f: f.write(schedules_route)
with open('src/app/api/schedules/[id]/route.ts', 'w') as f: f.write(schedule_id_route)
with open('src/app/api/schedules/[id]/status/route.ts', 'w') as f: f.write(schedule_status_route)
with open('src/app/api/schedules/[id]/complete/route.ts', 'w') as f: f.write(schedule_complete_route)
