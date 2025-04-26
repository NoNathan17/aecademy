import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Query from '@/models/Query';

export async function POST(req: NextRequest) {
  await connectMongo();

  const { userId, question, answer } = await req.json();

  if (!userId || !question || !answer) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const saved = await Query.create({ userId, question, answer });
  return NextResponse.json({ success: true, data: saved });
}