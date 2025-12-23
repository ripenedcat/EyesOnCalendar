'use client';

import React, { useState } from 'react';
import { ShiftData, TagArrangement, Person } from '@/types';

interface PeopleManagerProps {
  data: ShiftData;
  onAddUser: (alias: string, name: string) => void;
  onDeleteUser: (alias: string) => void;
  onUpdateGroups: (groups: TagArrangement[]) => void;
}

export default function PeopleManager({ data, onAddUser, onDeleteUser, onUpdateGroups }: PeopleManagerProps) {
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

  const handleDeleteGroup = (groupIndex: number) => {
    const group = data.tag_arrangement[groupIndex];

    // Prevent deleting Default group
    if (group.full_name === 'Default') {
      alert('Cannot delete the Default group');
      return;
    }

    const newGroups = data.tag_arrangement.filter((_, i) => i !== groupIndex);
    onUpdateGroups(newGroups);

    // Reset selected group index if needed
    if (selectedGroupIndex >= newGroups.length) {
      setSelectedGroupIndex(0);
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
        {/* Add/Delete User */}
        <div>
          <h4 className="font-semibold mb-2">User Management</h4>

          {/* Add User Form */}
          <form onSubmit={handleAddUser} className="space-y-2 mb-4">
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
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full">
              Add User
            </button>
          </form>

          {/* Delete User Section */}
          <div className="border-t pt-4">
            <h5 className="font-semibold mb-2 text-sm">Delete User</h5>
            <div className="space-y-2">
              {allMembers.map(person => (
                <div key={person.alias} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                  <span className="text-sm">
                    {person.name} <span className="text-gray-500">({person.alias})</span>
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${person.name}? This will remove them from all groups and future months.`)) {
                        onDeleteUser(person.alias);
                      }
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
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

          {/* Delete Group Section */}
          <div className="border-t pt-4 mb-4">
            <h5 className="font-semibold mb-2 text-sm">Delete Group</h5>
            <div className="space-y-2">
              {data.tag_arrangement.map((group, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                  <span className="text-sm">
                    {group.full_name} <span className="text-gray-500">({group.member.length} members)</span>
                  </span>
                  <button
                    onClick={() => {
                      if (group.full_name === 'Default') {
                        alert('Cannot delete the Default group');
                        return;
                      }
                      if (confirm(`Are you sure you want to delete the group "${group.full_name}"? Members will not be deleted, only the group.`)) {
                        handleDeleteGroup(index);
                      }
                    }}
                    disabled={group.full_name === 'Default'}
                    className={`px-3 py-1 rounded text-sm ${
                      group.full_name === 'Default'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Member to Group */}
          <div className="space-y-2 border-t pt-4">
            <h5 className="font-semibold mb-2 text-sm">Add Member to Group</h5>
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
