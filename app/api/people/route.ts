import { NextRequest, NextResponse } from 'next/server';
import { getShiftData, saveShiftData, getSubsequentShiftFiles } from '@/lib/data';
import { Day } from '@/types';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { year, month, alias, name } = body;

  if (!year || !month || !alias || !name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const data = await getShiftData(year, month);
  if (!data) {
    return NextResponse.json({ error: 'Data not found' }, { status: 404 });
  }

  if (data.people.some(p => p.alias === alias)) {
    return NextResponse.json({ error: 'Person already exists' }, { status: 400 });
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const newDays: Day[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    newDays.push({
      day: d,
      workType: isWeekend ? 'WD' : 'W'
    });
  }

  data.people.push({
    alias,
    name,
    days: newDays
  });

  // Also add to "Default" group in tag_arrangement if it exists
  const defaultGroup = data.tag_arrangement.find(g => g.full_name === 'Default');
  if (defaultGroup) {
    // Check if already in group (shouldn't be since we checked people list, but good to be safe)
    if (!defaultGroup.member.find(m => m.alias === alias)) {
      defaultGroup.member.push({ alias, name });
    }
  }

  await saveShiftData(year, month, data);

  // Propagate to subsequent months
  const subsequentFiles = await getSubsequentShiftFiles(year, month);
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

      // Add to Default group
      const subDefaultGroup = subData.tag_arrangement.find(g => g.full_name === 'Default');
      if (subDefaultGroup) {
        if (!subDefaultGroup.member.find(m => m.alias === alias)) {
          subDefaultGroup.member.push({ alias, name });
        }
      }
      await saveShiftData(file.year, file.month, subData);
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { year, month, alias } = body;

  if (!year || !month || !alias) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const data = await getShiftData(year, month);
  if (!data) {
    return NextResponse.json({ error: 'Data not found' }, { status: 404 });
  }

  // Check if person exists
  if (!data.people.some(p => p.alias === alias)) {
    return NextResponse.json({ error: 'Person not found' }, { status: 404 });
  }

  // Remove from people array
  data.people = data.people.filter(p => p.alias !== alias);

  // Remove from all groups
  for (const group of data.tag_arrangement) {
    group.member = group.member.filter(m => m.alias !== alias);
  }

  await saveShiftData(year, month, data);

  // Propagate to subsequent months
  const subsequentFiles = await getSubsequentShiftFiles(year, month);
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
