import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Query from '@/models/Query';

export async function POST(req: NextRequest) {
  await connectMongo();

  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const queries = await Query.find({ userId }).sort({ timestamp: -1 });

  return NextResponse.json({ success: true, data: queries });
}
