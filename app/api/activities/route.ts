import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import db from '@/lib/mongodb';
import Activity from '@/models/Activity';
import Trash from '@/models/Trash';

function getTodayIST(): string {
  const d = new Date();
  // Adjust to IST (+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(d.getTime() + istOffset);
  return istDate.toISOString().split('T')[0];
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    await db();
    const { searchParams } = new URL(req.url);
    const petId = searchParams.get('petId');
    const dayKey = searchParams.get('dayKey');

    const filter: any = { isDeleted: { $ne: true } };
    if (petId) filter.petId = petId;
    if (dayKey) filter.dayKey = dayKey;
    if (!petId && userId) {
      filter.$or = [{ ownerId: userId }, { caretakerId: userId }];
    }

    const activities = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, activities });
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
    const dayKey = body.dayKey || getTodayIST();

    const activity = await Activity.create({
      ...body,
      ownerId: userId || 'demo_user',
      performedByUid: userId || 'demo_user',
      performedByName: userName,
      dayKey,
      status: body.status || 'completed',
      completionTime: new Date(),
    });

    return NextResponse.json({ success: true, activity }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/activities?id=xxx - Soft-delete to Trash Bin
export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    await db();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Activity ID required' }, { status: 400 });
    }

    const activity = await Activity.findById(id);
    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Mark as soft deleted
    activity.isDeleted = true;
    await activity.save();

    // Create Trash record
    const userName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User';
    await Trash.create({
      petId: activity.petId,
      originalActivityId: activity._id.toString(),
      activitySnapshot: activity.toObject(),
      deletedByUid: userId || 'demo_user',
      deletedByName: userName,
      deletedAt: new Date(),
    });

    return NextResponse.json({ success: true, message: 'Activity moved to Bin' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

