import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import db from '@/lib/mongodb';
import Memory from '@/models/Memory';

// GET /api/memories?petId=xxx - Fetch all memories for a pet
export async function GET(req: Request) {
  try {
    await db();
    const { searchParams } = new URL(req.url);
    const petId = searchParams.get('petId');

    if (!petId) {
      return NextResponse.json({ error: 'petId required' }, { status: 400 });
    }

    const memories = await Memory.find({ petId }).sort({ date: -1 }).lean();
    return NextResponse.json({ success: true, memories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/memories - Add a new memory
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    await db();

    const body = await req.json();
    const { petId, title, caption, date, photoUrl } = body;

    if (!petId || !title || !date) {
      return NextResponse.json({ error: 'petId, title, and date are required' }, { status: 400 });
    }

    const memory = await Memory.create({
      petId,
      title,
      caption: caption || '',
      date,
      photoUrl: photoUrl || '',
      createdByUid: userId || 'demo_user',
      createdByName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User',
    });

    return NextResponse.json({ success: true, memory });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/memories?id=xxx - Delete a memory
export async function DELETE(req: Request) {
  try {
    await db();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Memory ID required' }, { status: 400 });
    }

    await Memory.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Memory deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
