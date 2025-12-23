import { NextResponse } from 'next/server';
import { getShiftMapping } from '@/lib/data';

export async function GET() {
  try {
    const data = await getShiftMapping();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load mapping' }, { status: 500 });
  }
}
