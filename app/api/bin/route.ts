import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import db from '@/lib/mongodb';
import Trash from '@/models/Trash';
import Activity from '@/models/Activity';

// GET /api/bin?petId=xxx - Get all soft-deleted records for a pet
export async function GET(req: Request) {
  try {
    await db();
    const { searchParams } = new URL(req.url);
    const petId = searchParams.get('petId');
    if (!petId) {
      return NextResponse.json({ error: 'petId required' }, { status: 400 });
    }

    const trashItems = await Trash.find({ petId, permanent: { $ne: true } })
      .sort({ deletedAt: -1 })
      .lean();

    return NextResponse.json({ success: true, items: trashItems });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/bin - Action: 'restore' | 'delete_permanent'
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    await db();
    const body = await req.json();
    const { trashId, action } = body;

    if (!trashId || !action) {
      return NextResponse.json({ error: 'trashId and action required' }, { status: 400 });
    }

    const trashDoc = await Trash.findById(trashId);
    if (!trashDoc) {
      return NextResponse.json({ error: 'Trash item not found' }, { status: 404 });
    }

    if (action === 'restore') {
      // Un-delete original activity log
      await Activity.findByIdAndUpdate(trashDoc.originalActivityId, { isDeleted: false });
      await Trash.findByIdAndDelete(trashId);
      return NextResponse.json({ success: true, message: 'Activity restored' });
    }

    if (action === 'delete_permanent') {
      trashDoc.permanent = true;
      await trashDoc.save();
      return NextResponse.json({ success: true, message: 'Item permanently deleted' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
