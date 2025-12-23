'use client';

import React, { useState } from 'react';
import { ShiftData, TagArrangement, Person } from '@/types';

interface PeopleManagerProps {
  data: ShiftData;
  onAddUser: (alias: string, name: string) => void;
  onUpdateGroups: (groups: TagArrangement[]) => void;
}

export default function PeopleManager({ data, onAddUser, onUpdateGroups }: PeopleManagerProps) {
  const [newAlias, setNewAlias] = useState('');
  const [newName, setNewName] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(0);
  const [selectedMemberAlias, setSelectedMemberAlias] = useState<string>('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAlias && newName) {
      onAddUser(newAlias, newName);
      setNewAlias('');
      setNewName('');
    }
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName) {
      const newGroups = [...data.tag_arrangement, { full_name: newGroupName, member: [] }];
      onUpdateGroups(newGroups);
      setNewGroupName('');
    }
  };

  const handleAddToGroup = () => {
    if (!selectedMemberAlias) return;

    const person = data.people.find(p => p.alias === selectedMemberAlias);
    if (!person) return;

    const targetGroup = data.tag_arrangement[selectedGroupIndex];
    
    // Check if already in group
    if (targetGroup.member.some(m => m.alias === selectedMemberAlias)) {
        alert('Member already in this group');
        return;
    }

    const newGroups = [...data.tag_arrangement];
    newGroups[selectedGroupIndex] = {
        ...targetGroup,
        member: [...targetGroup.member, { alias: person.alias, name: person.name }]
    };

    onUpdateGroups(newGroups);
  };

  // Get all available members (from people list)
  const allMembers = data.people;

  return (
    <div className="bg-white p-4 rounded shadow mt-8">
      <h3 className="text-lg font-bold mb-4">People & Group Management</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Add User */}
        <div>
          <h4 className="font-semibold mb-2">Add New User</h4>
          <form onSubmit={handleAddUser} className="space-y-2">
            <input
              type="text"
              placeholder="Alias (e.g. jianalu)"
              value={newAlias}
              onChange={e => setNewAlias(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="text"
              placeholder="Display Name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Add User
            </button>
          </form>
        </div>

        {/* Group Management */}
        <div>
          <h4 className="font-semibold mb-2">Group Management</h4>
          
          {/* Add Group */}
          <form onSubmit={handleAddGroup} className="flex space-x-2 mb-4">
            <input
              type="text"
              placeholder="New Group Name"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              className="border p-2 rounded flex-1"
            />
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Create Group
            </button>
          </form>

          {/* Add Member to Group */}
          <div className="space-y-2">
            <div className="flex space-x-2">
              <select
                value={selectedMemberAlias}
                onChange={e => setSelectedMemberAlias(e.target.value)}
                className="border p-2 rounded flex-1"
              >
                <option value="">Select Member</option>
                {allMembers.map(p => (
                  <option key={p.alias} value={p.alias}>{p.name} ({p.alias})</option>
                ))}
              </select>
              <span>to</span>
              <select
                value={selectedGroupIndex}
                onChange={e => setSelectedGroupIndex(Number(e.target.value))}
                className="border p-2 rounded flex-1"
              >
                {data.tag_arrangement.map((g, i) => (
                  <option key={i} value={i}>{g.full_name}</option>
                ))}
              </select>
            </div>
            <button onClick={handleAddToGroup} className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 w-full">
              Add to Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
