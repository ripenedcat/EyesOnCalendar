import fs from 'fs/promises';
import path from 'path';
import { ShiftData, ShiftMapping, Person, Day } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');

export async function getShiftMapping(): Promise<ShiftMapping> {
  const filePath = path.join(DATA_DIR, 'shiftmapping.json');
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

export async function getShiftData(year: number, month: number): Promise<ShiftData | null> {
  const fileName = `${year}${month.toString().padStart(2, '0')}shift.json`;
  const filePath = path.join(DATA_DIR, fileName);
  try {
    const dataStr = await fs.readFile(filePath, 'utf-8');
    const data: ShiftData = JSON.parse(dataStr);

    if (!data.tag_arrangement) {
      data.tag_arrangement = [];
    }

    // Ensure Default group has all members
    if (data.tag_arrangement) {
      let defaultGroup = data.tag_arrangement.find(g => g.full_name === 'Default');
      
      if (!defaultGroup) {
        defaultGroup = {
          full_name: 'Default',
          member: []
        };
        data.tag_arrangement.unshift(defaultGroup);
      }

      const existingMemberAliases = new Set(defaultGroup.member.map(m => m.alias));
      
      data.people.forEach(person => {
        if (!existingMemberAliases.has(person.alias)) {
          defaultGroup!.member.push({
            name: person.name,
            alias: person.alias
          });
          existingMemberAliases.add(person.alias);
        }
      });
    }

    return data;
  } catch (error) {
    return null;
  }
}

export async function saveShiftData(year: number, month: number, data: ShiftData): Promise<void> {
  const fileName = `${year}${month.toString().padStart(2, '0')}shift.json`;
  const filePath = path.join(DATA_DIR, fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function createShiftData(year: number, month: number): Promise<ShiftData> {
  // Determine previous month
  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear = year - 1;
  }

  const prevData = await getShiftData(prevYear, prevMonth);
  if (!prevData) {
    throw new Error(`Previous month data (${prevYear}-${prevMonth}) not found. Cannot create new month.`);
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  
  const newPeople: Person[] = prevData.people.map(person => {
    const newDays: Day[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      newDays.push({
        day: d,
        workType: isWeekend ? 'WD' : 'W'
      });
    }
    return {
      ...person,
      days: newDays
    };
  });

  const newData: ShiftData = {
    ...prevData,
    year,
    month,
    lockdate: [], // Reset lockdate
    people: newPeople
  };

  await saveShiftData(year, month, newData);
  return newData;
}

export async function getSubsequentShiftFiles(startYear: number, startMonth: number): Promise<{ year: number; month: number; data: ShiftData }[]> {
  const files = await fs.readdir(DATA_DIR);
  const shiftFiles = files.filter(f => f.match(/^\d{6}shift\.json$/));
  
  const subsequentFiles: { year: number; month: number; data: ShiftData }[] = [];
  
  for (const file of shiftFiles) {
    const year = parseInt(file.substring(0, 4));
    const month = parseInt(file.substring(4, 6));
    
    if (year > startYear || (year === startYear && month > startMonth)) {
       const data = await getShiftData(year, month);
       if (data) {
           subsequentFiles.push({ year, month, data });
       }
    }
  }
  return subsequentFiles;
}
