import { query } from './db';
import { ShiftData, ShiftMapping, Person, Day } from '@/types';

export async function getShiftMapping(): Promise<ShiftMapping> {
  const rows = await query<{ day_types: any }>(
    'SELECT day_types FROM shift_mapping ORDER BY id DESC LIMIT 1'
  );

  if (rows.length === 0) {
    throw new Error('Shift mapping not found in database');
  }

  return { dayTypes: rows[0].day_types };
}

export async function getShiftData(year: number, month: number): Promise<ShiftData | null> {
  const rows = await query<{
    year: number;
    month: number;
    pod: string;
    lockdate: number[];
    people: any;
    tag_arrangement: any;
  }>(
    'SELECT year, month, pod, lockdate, people, tag_arrangement FROM shift_data WHERE year = $1 AND month = $2',
    [year, month]
  );

  if (rows.length === 0) {
    return null;
  }

  const data: ShiftData = {
    year: rows[0].year,
    month: rows[0].month,
    pod: rows[0].pod,
    lockdate: rows[0].lockdate || [],
    people: rows[0].people || [],
    tag_arrangement: rows[0].tag_arrangement || []
  };

  // Ensure tag_arrangement is initialized
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
}

export async function saveShiftData(year: number, month: number, data: ShiftData): Promise<void> {
  await query(
    `INSERT INTO shift_data (year, month, pod, lockdate, people, tag_arrangement, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
     ON CONFLICT (year, month)
     DO UPDATE SET
       pod = EXCLUDED.pod,
       lockdate = EXCLUDED.lockdate,
       people = EXCLUDED.people,
       tag_arrangement = EXCLUDED.tag_arrangement,
       updated_at = CURRENT_TIMESTAMP`,
    [
      year,
      month,
      data.pod,
      data.lockdate || [],
      JSON.stringify(data.people),
      JSON.stringify(data.tag_arrangement)
    ]
  );
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
  const rows = await query<{
    year: number;
    month: number;
    pod: string;
    lockdate: number[];
    people: any;
    tag_arrangement: any;
  }>(
    `SELECT year, month, pod, lockdate, people, tag_arrangement
     FROM shift_data
     WHERE (year > $1) OR (year = $1 AND month > $2)
     ORDER BY year, month`,
    [startYear, startMonth]
  );

  const subsequentFiles: { year: number; month: number; data: ShiftData }[] = [];

  for (const row of rows) {
    const data: ShiftData = {
      year: row.year,
      month: row.month,
      pod: row.pod,
      lockdate: row.lockdate || [],
      people: row.people || [],
      tag_arrangement: row.tag_arrangement || []
    };
    subsequentFiles.push({ year: row.year, month: row.month, data });
  }

  return subsequentFiles;
}
