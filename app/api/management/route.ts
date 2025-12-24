import { NextResponse } from 'next/server';
import { getShiftMapping } from '@/lib/data';

export async function GET() {
  try {
    const mapping = await getShiftMapping();
    return NextResponse.json({
      people: mapping.globalPeople,
      groups: mapping.tagGroups
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load management data' }, { status: 500 });
  }
}
