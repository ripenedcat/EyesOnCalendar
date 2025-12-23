'use client';

import React, { useEffect, useState } from 'react';
import PeopleManager from '../components/PeopleManager';
import { ShiftData, TagArrangement } from '@/types';
import Link from 'next/link';

export default function ManagementPage() {
  const [shiftData, setShiftData] = useState<ShiftData | null>(null);
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(12);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // For management, we might want to load the current month or allow selection.
    // For simplicity, let's load the default 2025-12 or get from URL params if we were passing them.
    // Here I'll just load 2025-12 as a default context for editing people/groups.
    fetchShiftData(2025, 12);
  }, []);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchShiftData = async (y: number, m: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shifts?year=${y}&month=${m}`);
      if (res.ok) {
        const data = await res.json();
        setShiftData(data);
        setYear(y);
        setMonth(m);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (alias: string, name: string) => {
    if (!shiftData) return;
    
    const daysInMonth = new Date(year, month, 0).getDate();
    const newDays = [];
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month - 1, d);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        newDays.push({ day: d, workType: isWeekend ? 'WD' : 'W' });
    }

    const newUser = { alias, name, days: newDays };
    const newData = { ...shiftData, people: [...shiftData.people, newUser] };
    
    // Optimistic update
    setShiftData(newData);

    try {
      const res = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          year: shiftData.year, 
          month: shiftData.month, 
          alias, 
          name 
        }),
      });

      if (res.ok) {
        showNotification(`User ${name} added successfully`, 'success');
      } else {
        const errorData = await res.json();
        showNotification(errorData.error || 'Failed to add user', 'error');
        // Revert optimistic update if needed, but for now we'll just show error
        // Ideally we should reload data here
        fetchShiftData(year, month);
      }
    } catch (err) {
      showNotification('Network error while adding user', 'error');
      fetchShiftData(year, month);
    }
  };

  const handleUpdateGroups = async (newGroups: TagArrangement[]) => {
    if (!shiftData) return;
    const newData = { ...shiftData, tag_arrangement: newGroups };
    
    // Optimistic update
    setShiftData(newData);

    try {
      const res = await fetch('/api/groups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: shiftData.year,
          month: shiftData.month,
          tag_arrangement: newGroups
        }),
      });

      if (res.ok) {
        showNotification('Groups updated successfully', 'success');
      } else {
        const errorData = await res.json();
        showNotification(errorData.error || 'Failed to update groups', 'error');
        fetchShiftData(year, month);
      }
    } catch (err) {
      showNotification('Network error while updating groups', 'error');
      fetchShiftData(year, month);
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

      {shiftData && (
        <PeopleManager
          data={shiftData}
          onAddUser={handleAddUser}
          onUpdateGroups={handleUpdateGroups}
        />
      )}
    </main>
  );
}
