import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import db from '@/lib/mongodb';
import HealthRecord from '@/models/HealthRecord';

export async function GET(req: Request) {
  try {
    await db();
    const { searchParams } = new URL(req.url);
    const petId = searchParams.get('petId');
    const recordType = searchParams.get('recordType');

    const filter: any = {};
    if (petId) filter.petId = petId;
    if (recordType) filter.recordType = recordType;

    const records = await HealthRecord.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, records });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    await db();

    const body = await req.json();
    const userName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User';

    const record = await HealthRecord.create({
      ...body,
      ownerId: userId || 'demo_user',
      recordedByUid: userId || 'demo_user',
      recordedByName: userName,
      date: body.date || new Date().toISOString().split('T')[0],
    });

    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

