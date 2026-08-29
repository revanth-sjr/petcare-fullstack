import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/lib/mongodb';
import Medication from '@/models/Medication';

export async function GET(req: Request) {
  try {
    await db();
    const { searchParams } = new URL(req.url);
    const petId = searchParams.get('petId');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const filter: any = {};
    if (petId) filter.petId = petId;
    if (activeOnly) filter.active = true;

    const medications = await Medication.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, medications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    await db();
    const body = await req.json();

    const medication = await Medication.create({
      ...body,
      ownerId: userId || 'demo_user',
    });

    return NextResponse.json({ success: true, medication }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await db();
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Medication ID required' }, { status: 400 });
    }

    const medication = await Medication.findByIdAndUpdate(id, updates, { new: true });
    return NextResponse.json({ success: true, medication });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await db();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Medication ID required' }, { status: 400 });
    }

    await Medication.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Medication deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
