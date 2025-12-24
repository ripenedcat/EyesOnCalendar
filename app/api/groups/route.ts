import { NextRequest, NextResponse } from 'next/server';
import { saveShiftData, getSubsequentShiftFiles, saveTagGroups } from '@/lib/data';

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { tag_arrangement } = body;

  if (!tag_arrangement) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Save to global tag groups
  await saveTagGroups(tag_arrangement);

  // Propagate to all existing months
  const subsequentFiles = await getSubsequentShiftFiles(0, 0); // Get all files

  // Create a map of alias -> groupName from the new arrangement
  const aliasToGroupMap = new Map<string, string>();
  for (const group of tag_arrangement) {
      for (const member of group.member) {
          aliasToGroupMap.set(member.alias, group.full_name);
      }
  }

  for (const file of subsequentFiles) {
      const subData = file.data;
      let changed = false;

      // 1. Ensure all groups exist in subData
      const newGroupNames = new Set(tag_arrangement.map((g: any) => g.full_name));

      // Add missing groups
      for (const groupName of Array.from(newGroupNames) as string[]) {
          if (!subData.tag_arrangement.find(g => g.full_name === groupName)) {
              subData.tag_arrangement.push({ full_name: groupName, member: [] });
              changed = true;
          }
      }

      // 2. Remove groups that don't exist in global config
      const groupsToKeep = subData.tag_arrangement.filter(g => newGroupNames.has(g.full_name));
      if (groupsToKeep.length !== subData.tag_arrangement.length) {
          subData.tag_arrangement = groupsToKeep;
          changed = true;
      }

      // 3. Move people
      for (const [alias, targetGroupName] of aliasToGroupMap.entries()) {
          // Find which group this person is currently in within subData
          let currentGroupIndex = -1;
          let currentMemberIndex = -1;

          for (let i = 0; i < subData.tag_arrangement.length; i++) {
              const idx = subData.tag_arrangement[i].member.findIndex(m => m.alias === alias);
              if (idx !== -1) {
                  currentGroupIndex = i;
                  currentMemberIndex = idx;
                  break;
              }
          }

          // If person found in subData
          if (currentGroupIndex !== -1) {
              const currentGroup = subData.tag_arrangement[currentGroupIndex];

              // If they are in the wrong group
              if (currentGroup.full_name !== targetGroupName) {
                  // Remove from old group
                  const member = currentGroup.member[currentMemberIndex];
                  currentGroup.member.splice(currentMemberIndex, 1);

                  // Add to new group
                  const targetGroup = subData.tag_arrangement.find(g => g.full_name === targetGroupName);
                  if (targetGroup) {
                      targetGroup.member.push(member);
                      changed = true;
                  }
              }
          } else {
              // Person exists in subData.people but not in any group?
              const personInSub = subData.people.find(p => p.alias === alias);
              if (personInSub) {
                  // Add to target group
                  const targetGroup = subData.tag_arrangement.find(g => g.full_name === targetGroupName);
                  if (targetGroup) {
                      targetGroup.member.push({ alias: personInSub.alias, name: personInSub.name });
                      changed = true;
                  }
              }
          }
      }

      if (changed) {
          await saveShiftData(file.year, file.month, subData);
      }
  }

  return NextResponse.json({ success: true });
}
