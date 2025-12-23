'use client';

import React, { useEffect, useState } from 'react';
import ShiftGrid from '../../components/ShiftGrid';
import MonthNavigation from '../../components/MonthNavigation';
import { ShiftData, ShiftMapping } from '@/types';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function MonthPage() {
  const params = useParams();
  const router = useRouter();
  
  // Parse params. year and month are strings from URL
  const paramYear = parseInt(params.year as string);
  const paramMonth = parseInt(params.month as string);

  const [shiftData, setShiftData] = useState<ShiftData | null>(null);
  const [mapping, setMapping] = useState<ShiftMapping | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isNaN(paramYear) && !isNaN(paramMonth)) {
        fetchMapping();
        fetchShiftData(paramYear, paramMonth);
    }
  }, [paramYear, paramMonth]);

  const fetchMapping = async () => {
    try {
      const res = await fetch('/api/mapping');
      if (!res.ok) throw new Error('Failed to load mapping');
      const data = await res.json();
      setMapping(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchShiftData = async (y: number, m: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/shifts?year=${y}&month=${m}`);
      if (res.status === 404) {
        setShiftData(null);
        setError('NOT_FOUND');
      } else if (!res.ok) {
        throw new Error('Failed to load data');
      } else {
        const data = await res.json();
        setShiftData(data);
      }
    } catch (err) {
      setError('Error loading data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createShiftData = async () => {
    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: paramYear, month: paramMonth }),
      });
      if (!res.ok) throw new Error('Failed to create data');
      const data = await res.json();
      setShiftData(data);
      setError(null);
    } catch (err) {
      alert('Failed to create new month data. Make sure previous month exists.');
    }
  };

  const handleNavigate = (y: number, m: number) => {
    router.push(`/${y}/${m}`);
  };

  const handleUpdateShift = async (alias: string, day: number, workType: string) => {
    if (!shiftData) return;

    const updatedPeople = shiftData.people.map(p => {
      if (p.alias === alias) {
        const updatedDays = p.days.map(d => {
          if (d.day === day) return { ...d, workType };
          return d;
        });
        if (!p.days.find(d => d.day === day)) {
            updatedDays.push({ day, workType });
        }
        return { ...p, days: updatedDays };
      }
      return p;
    });

    const newData = { ...shiftData, people: updatedPeople };
    setShiftData(newData);

    await fetch('/api/shifts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        year: shiftData.year, 
        month: shiftData.month, 
        alias, 
        day, 
        workType 
      }),
    });
  };

  const handleToggleLock = async (day: number) => {
    if (!shiftData) return;

    // Optimistic update
    const isLocked = shiftData.lockdate.includes(day);
    let newLockdate = [...shiftData.lockdate];
    if (isLocked) {
        newLockdate = newLockdate.filter(d => d !== day);
    } else {
        newLockdate.push(day);
        newLockdate.sort((a, b) => a - b);
    }

    setShiftData({ ...shiftData, lockdate: newLockdate });

    try {
        const res = await fetch('/api/shifts', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                year: shiftData.year,
                month: shiftData.month,
                action: 'toggleLock',
                lockDay: day
            }),
        });
        if (!res.ok) throw new Error('Failed to toggle lock');
        const data = await res.json();
        // Sync with server response to be sure
        if (data.lockdate) {
            setShiftData(prev => prev ? { ...prev, lockdate: data.lockdate } : null);
        }
    } catch (err) {
        console.error(err);
        // Revert on error
        setShiftData({ ...shiftData });
        alert('Failed to update lock status');
    }
  };

  if (!mapping) return <div className="p-8">Loading configuration...</div>;

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="w-[calc(100%-200px)] mx-auto relative">
        <div className="flex flex-col items-center gap-4 mb-8 w-full">
          <h1 className="text-3xl font-bold text-blue-800">{shiftData?.pod || 'Shift Management System'}</h1>
          <div className="absolute top-0 right-0">
            <Link 
              href="/management"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded inline-flex items-center"
            >
              <span>⚙️ Manage People & Groups</span>
            </Link>
          </div>
          <MonthNavigation year={paramYear} month={paramMonth} onNavigate={handleNavigate} />
        </div>

        {loading && <div>Loading data...</div>}
        
        {error === 'NOT_FOUND' && (
          <div className="text-center py-8">
            <p className="text-xl mb-4">Data for {paramYear}-{paramMonth} not found.</p>
            <button 
              onClick={createShiftData}
              className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
            >
              Create {paramYear}-{paramMonth} Data (Copy from previous month)
            </button>
          </div>
        )}

        {error && error !== 'NOT_FOUND' && <div className="text-red-500">{error}</div>}

        {shiftData && (
          <ShiftGrid
            data={shiftData}
            mapping={mapping}
            onUpdateShift={handleUpdateShift}
            onToggleLock={handleToggleLock}
          />
        )}
      </div>
    </main>
  );
}
