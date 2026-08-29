import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/lib/mongodb';
import Pet from '@/models/Pet';

export async function GET() {
  try {
    const { userId } = await auth();
    await db();

    // Query active pets owned by user or where user is a caretaker
    const filter = userId
      ? { $or: [{ ownerId: userId }, { caretakerIds: userId }], status: { $ne: 'archived' } }
      : { status: { $ne: 'archived' } };

    const pets = await Pet.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, pets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    await db();
    const body = await req.json();

    const pet = await Pet.create({
      ...body,
      ownerId: userId || 'demo_user',
      caretakerIds: body.caretakerIds || [],
      feedingSchedule: body.feedingSchedule || { times: ['08:00', '13:00', '19:00'], notes: '' },
      dailyTargets: { feeding: body.feedingSchedule?.times?.length || 3 },
    });

    return NextResponse.json({ success: true, pet }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

