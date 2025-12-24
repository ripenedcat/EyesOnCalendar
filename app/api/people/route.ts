import { NextRequest, NextResponse } from 'next/server';
import { saveShiftData, getSubsequentShiftFiles, getShiftMapping, saveGlobalPeople } from '@/lib/data';
import { Day } from '@/types';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { alias, name } = body;

  if (!alias || !name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Add to global people
  const shiftMapping = await getShiftMapping();
  const globalPeople = shiftMapping.globalPeople;

  if (globalPeople.some(p => p.alias === alias)) {
    return NextResponse.json({ error: 'Person already exists in global configuration' }, { status: 400 });
  }

  globalPeople.push({ alias, name });
  await saveGlobalPeople(globalPeople);

  // Propagate to all existing months
  const subsequentFiles = await getSubsequentShiftFiles(0, 0); // Get all files
  for (const file of subsequentFiles) {
    const subData = file.data;

    // Check if person exists
    if (!subData.people.some(p => p.alias === alias)) {
      const subDaysInMonth = new Date(file.year, file.month, 0).getDate();
      const subNewDays: Day[] = [];
      for (let d = 1; d <= subDaysInMonth; d++) {
        const date = new Date(file.year, file.month - 1, d);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        subNewDays.push({
          day: d,
          workType: isWeekend ? 'WD' : 'W'
        });
      }
      subData.people.push({
        alias,
        name,
        days: subNewDays
      });

      // Add to All group
      const subAllGroup = subData.tag_arrangement.find(g => g.full_name === 'All');
      if (subAllGroup) {
        if (!subAllGroup.member.find(m => m.alias === alias)) {
          subAllGroup.member.push({ alias, name });
        }
      }
      await saveShiftData(file.year, file.month, subData);
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { alias } = body;

  if (!alias) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Remove from global people
  const shiftMapping = await getShiftMapping();
  const globalPeople = shiftMapping.globalPeople;
  const updatedGlobalPeople = globalPeople.filter(p => p.alias !== alias);
  await saveGlobalPeople(updatedGlobalPeople);

  // Propagate to all existing months
  const subsequentFiles = await getSubsequentShiftFiles(0, 0); // Get all files
  for (const file of subsequentFiles) {
    const subData = file.data;

    // Remove from people
    subData.people = subData.people.filter(p => p.alias !== alias);

    // Remove from all groups
    for (const group of subData.tag_arrangement) {
      group.member = group.member.filter(m => m.alias !== alias);
    }

    await saveShiftData(file.year, file.month, subData);
  }

  return NextResponse.json({ success: true });
}
