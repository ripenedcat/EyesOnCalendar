'use client';

import React, { useEffect, useState } from 'react';
import PeopleManager from '../components/PeopleManager';
import { Member, TagArrangement } from '@/types';
import Link from 'next/link';

interface ManagementData {
  people: Member[];
  groups: TagArrangement[];
}

export default function ManagementPage() {
  const [managementData, setManagementData] = useState<ManagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchManagementData();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchManagementData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/management');
      if (res.ok) {
        const data = await res.json();
        setManagementData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (alias: string, name: string) => {
    if (!managementData) return;

    const newUser = { alias, name };
    const newData = { ...managementData, people: [...managementData.people, newUser] };

    // Optimistic update
    setManagementData(newData);

    try {
      const res = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias, name }),
      });

      if (res.ok) {
        showNotification(`User ${name} added successfully`, 'success');
      } else {
        const errorData = await res.json();
        showNotification(errorData.error || 'Failed to add user', 'error');
        fetchManagementData();
      }
    } catch (err) {
      showNotification('Network error while adding user', 'error');
      fetchManagementData();
    }
  };

  const handleDeleteUser = async (alias: string) => {
    if (!managementData) return;

    // Optimistic update
    const newData = {
      ...managementData,
      people: managementData.people.filter(p => p.alias !== alias),
      groups: managementData.groups.map(g => ({
        ...g,
        member: g.member.filter(m => m.alias !== alias)
      }))
    };
    setManagementData(newData);

    try {
      const res = await fetch('/api/people', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias }),
      });

      if (res.ok) {
        showNotification(`User deleted successfully`, 'success');
      } else {
        const errorData = await res.json();
        showNotification(errorData.error || 'Failed to delete user', 'error');
        fetchManagementData();
      }
    } catch (err) {
      showNotification('Network error while deleting user', 'error');
      fetchManagementData();
    }
  };

  const handleUpdateGroups = async (newGroups: TagArrangement[]) => {
    if (!managementData) return;
    const newData = { ...managementData, groups: newGroups };

    // Optimistic update
    setManagementData(newData);

    try {
      const res = await fetch('/api/groups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag_arrangement: newGroups }),
      });

      if (res.ok) {
        showNotification('Groups updated successfully', 'success');
      } else {
        const errorData = await res.json();
        showNotification(errorData.error || 'Failed to update groups', 'error');
        fetchManagementData();
      }
    } catch (err) {
      showNotification('Network error while updating groups', 'error');
      fetchManagementData();
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-800">Management</h1>
        <Link href="/" className="text-blue-600 hover:underline">
          &larr; Back to Shift Grid
        </Link>
      </div>

      {/* Notification Popout */}
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded shadow-lg text-white z-50 transition-opacity duration-300 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.message}
        </div>
      )}

      {loading && <div>Loading...</div>}

      {managementData && (
        <PeopleManager
          data={{
            people: managementData.people.map(p => ({ ...p, days: [] })),
            tag_arrangement: managementData.groups
          }}
          onAddUser={handleAddUser}
          onDeleteUser={handleDeleteUser}
          onUpdateGroups={handleUpdateGroups}
        />
      )}
    </main>
  );
}
