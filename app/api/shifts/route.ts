import { NextRequest, NextResponse } from 'next/server';
import { getShiftData, createShiftData, saveShiftData } from '@/lib/data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = parseInt(searchParams.get('year') || '');
  const month = parseInt(searchParams.get('month') || '');

  if (!year || !month) {
    return NextResponse.json({ error: 'Year and month are required' }, { status: 400 });
  }

  const data = await getShiftData(year, month);
  if (!data) {
    return NextResponse.json({ error: 'Data not found', notFound: true }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { year, month } = body;

  if (!year || !month) {
    return NextResponse.json({ error: 'Year and month are required' }, { status: 400 });
  }

  try {
    // Check if data already exists to prevent accidental overwrite
    const existingData = await getShiftData(year, month);
    if (existingData) {
      return NextResponse.json({ error: 'Data for this month already exists' }, { status: 409 });
    }

    const data = await createShiftData(year, month);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { year, month, alias, day, workType, action, lockDay } = body;

  if (!year || !month) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const data = await getShiftData(year, month);
  if (!data) {
    return NextResponse.json({ error: 'Data not found' }, { status: 404 });
  }

  // Handle Lock Toggle
  if (action === 'toggleLock' && lockDay) {
      const isLocked = data.lockdate.includes(lockDay);
      if (isLocked) {
          data.lockdate = data.lockdate.filter(d => d !== lockDay);
      } else {
          if (!data.lockdate.includes(lockDay)) {
              data.lockdate.push(lockDay);
              data.lockdate.sort((a, b) => a - b);
          }
      }
      await saveShiftData(year, month, data);
      return NextResponse.json({ success: true, lockdate: data.lockdate });
  }

  if (!alias || !day || !workType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const person = data.people.find(p => p.alias === alias);
  if (!person) {
    return NextResponse.json({ error: 'Person not found' }, { status: 404 });
  }

  const dayRecord = person.days.find(d => d.day === day);
  if (dayRecord) {
    dayRecord.workType = workType;
  } else {
    // Should not happen if data is consistent, but handle it
    person.days.push({ day, workType });
  }

  await saveShiftData(year, month, data);
  return NextResponse.json({ success: true });
}
