import { query } from './db';
import { ShiftData, ShiftMapping, Person, Day, TagArrangement, Member } from '@/types';

export async function getShiftMapping(): Promise<ShiftMapping> {
  const rows = await query<{ day_types: ShiftMapping['dayTypes']; tag_groups: TagArrangement[]; global_people: Member[] }>(
    'SELECT day_types, tag_groups, global_people FROM shift_mapping ORDER BY id DESC LIMIT 1'
  );

  if (rows.length === 0) {
    throw new Error('Shift mapping not found in database');
  }

  return {
    dayTypes: rows[0].day_types,
    tagGroups: rows[0].tag_groups || [{ full_name: 'All', member: [] }],
    globalPeople: rows[0].global_people || []
  };
}

export async function saveTagGroups(tagGroups: TagArrangement[]): Promise<void> {
  await query(
    'UPDATE shift_mapping SET tag_groups = $1, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM shift_mapping ORDER BY id DESC LIMIT 1)',
    [JSON.stringify(tagGroups)]
  );
}

export async function saveGlobalPeople(people: Member[]): Promise<void> {
  await query(
    'UPDATE shift_mapping SET global_people = $1, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM shift_mapping ORDER BY id DESC LIMIT 1)',
    [JSON.stringify(people)]
  );
}

export async function getShiftData(year: number, month: number): Promise<ShiftData | null> {
  const rows = await query<{
    year: number;
    month: number;
    pod: string;
    lockdate: number[];
    people: Person[];
    tag_arrangement: TagArrangement[];
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

  // Ensure All group has all members
  if (data.tag_arrangement) {
    let allGroup = data.tag_arrangement.find(g => g.full_name === 'All');

    if (!allGroup) {
      allGroup = {
        full_name: 'All',
        member: []
      };
      data.tag_arrangement.unshift(allGroup);
    }

    const existingMemberAliases = new Set(allGroup.member.map(m => m.alias));

    data.people.forEach(person => {
      if (!existingMemberAliases.has(person.alias)) {
        allGroup!.member.push({
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
  // Get global data
  const shiftMapping = await getShiftMapping();
  const globalPeople = shiftMapping.globalPeople;
  const globalTagGroups = shiftMapping.tagGroups;

  if (globalPeople.length === 0) {
    throw new Error('No people defined in global configuration. Please add members first.');
  }

  const daysInMonth = new Date(year, month, 0).getDate();

  // Create people with days based on global people list
  const newPeople: Person[] = globalPeople.map(member => {
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
      alias: member.alias,
      name: member.name,
      days: newDays
    };
  });

  // Use global tag groups and populate members
  const newTagArrangement: TagArrangement[] = globalTagGroups.map(group => {
    if (group.full_name === 'All') {
      // All group should contain all people
      return {
        full_name: 'All',
        member: newPeople.map(p => ({ alias: p.alias, name: p.name }))
      };
    } else {
      // For other groups, keep only members that still exist in global people
      return {
        full_name: group.full_name,
        member: group.member.filter(m =>
          globalPeople.some(p => p.alias === m.alias)
        )
      };
    }
  });

  // Get pod from previous month if exists, otherwise use default
  let pod = 'Default';
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevData = await getShiftData(prevYear, prevMonth);
  if (prevData) {
    pod = prevData.pod;
  }

  const newData: ShiftData = {
    year,
    month,
    pod,
    lockdate: [],
    people: newPeople,
    tag_arrangement: newTagArrangement
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
    people: Person[];
    tag_arrangement: TagArrangement[];
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
