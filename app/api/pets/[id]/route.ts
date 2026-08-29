import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/lib/mongodb';
import Pet from '@/models/Pet';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await db();
    const { id } = await params;
    const pet = await Pet.findById(id).lean();

    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, pet });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    await db();
    const body = await req.json();

    if (body.feedingSchedule?.times) {
      body.dailyTargets = { feeding: body.feedingSchedule.times.length };
    }

    const pet = await Pet.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ success: true, pet });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    await db();

    // Soft delete by setting status to archived
    await Pet.findByIdAndUpdate(id, { status: 'archived' });
    return NextResponse.json({ success: true, message: 'Pet archived' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

