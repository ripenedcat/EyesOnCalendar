'use client';

import React, { useState, useMemo } from 'react';
import { ShiftData, ShiftMapping, Person, TagArrangement } from '@/types';
import ShiftModal from './ShiftModal';

interface ShiftGridProps {
  data: ShiftData;
  mapping: ShiftMapping;
  onUpdateShift: (alias: string, day: number, workType: string) => void;
  onToggleLock: (day: number) => void;
}

export default function ShiftGrid({ data, mapping, onUpdateShift, onToggleLock }: ShiftGridProps) {
  const [selectedCell, setSelectedCell] = useState<{ alias: string; day: number; currentWorkType: string; personName: string; x: number; y: number } | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ alias: string | null; day: number | null }>({ alias: null, day: null });
  const [activeDatePopup, setActiveDatePopup] = useState<{ day: number; x: number; y: number } | null>(null);
  // Default to the first group in the arrangement
  const [activeTab, setActiveTab] = useState<string>(data.tag_arrangement[0]?.full_name || '');

  const daysInMonth = new Date(data.year, data.month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleDateClick = (e: React.MouseEvent, day: number) => {
    e.preventDefault();
    setActiveDatePopup({ day, x: e.clientX, y: e.clientY });
  };

  const handleLockToggle = () => {
    if (activeDatePopup) {
      onToggleLock(activeDatePopup.day);
      setActiveDatePopup(null);
    }
  };

  const handleCellClick = (e: React.MouseEvent, alias: string, day: number, workType: string, personName: string) => {
    if (data.lockdate.includes(day)) {
      alert('This date is locked and cannot be modified.');
      return;
    }
    // Calculate position near the click, but keep it within bounds if possible
    // Simple approach: use clientX/Y
    setSelectedCell({ 
        alias, 
        day, 
        currentWorkType: workType, 
        personName,
        x: e.clientX,
        y: e.clientY
    });
  };

  const handleModalSubmit = (workType: string) => {
    if (selectedCell) {
      onUpdateShift(selectedCell.alias, selectedCell.day, workType);
      setSelectedCell(null);
    }
  };

  // Helper to get person data by alias
  const getPerson = (alias: string) => data.people.find(p => p.alias === alias);

  // Calculate OnDuty stats per day
  const onDutyStats = useMemo(() => {
    // Get members of the active group
    const activeGroup = data.tag_arrangement.find(g => g.full_name === activeTab);
    const activeMembers = activeGroup ? activeGroup.member : [];
    const activeAliases = new Set(activeMembers.map(m => m.alias));

    return days.map(day => {
      let totalOnDuty = 0;
      let totalPeople = 0;

      data.people.forEach(person => {
        // Only include if person is in the active group
        if (activeAliases.has(person.alias)) {
          const dayRecord = person.days.find(d => d.day === day);
          if (dayRecord) {
            const type = mapping.dayTypes[dayRecord.workType];
            if (type) {
              totalOnDuty += type.isOnDuty;
            }
            totalPeople++;
          }
        }
      });

      return totalPeople > 0 ? (totalOnDuty / totalPeople) : 0;
    });
  }, [data, mapping, days, activeTab]);

  const getCellColor = (workType: string) => {
    const type = mapping.dayTypes[workType];
    if (!type) return '#ffffff';
    
    switch (type.color) {
      case 'green': return '#4ade80'; // green-400
      case 'lime': return '#a3e635'; // lime-400
      case 'emerald': return '#34d399'; // emerald-400
      case 'blue': return '#60a5fa'; // blue-400
      case 'fuchsia': return '#e879f9'; // fuchsia-400
      case 'pink': return '#f472b6'; // pink-400
      case 'rose': return '#fb7185'; // rose-400
      case 'yellow': return '#facc15'; // yellow-400
      case 'amber': return '#fbbf24'; // amber-400
      case 'orange': return '#fb923c'; // orange-400
      case 'cyan': return '#22d3ee'; // cyan-400
      case 'indigo': return '#818cf8'; // indigo-400
      case 'violet': return '#a78bfa'; // violet-400
      case 'red': return '#f87171'; // red-400
      default: return '#e5e7eb';
    }
  };
  
  const getTextColor = (workType: string) => {
      const type = mapping.dayTypes[workType];
      if (!type) return 'black';
      // Darker backgrounds need white text
      return ['emerald', 'blue', 'fuchsia', 'pink', 'rose', 'orange', 'cyan', 'indigo', 'violet', 'red'].includes(type.color) ? 'white' : 'black';
  }

  // Filter people based on active tab
  const filteredGroups = useMemo(() => {
    const group = data.tag_arrangement.find(g => g.full_name === activeTab);
    return group ? [group] : [];
  }, [activeTab, data]);

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex space-x-2 mb-4 border-b">
        {data.tag_arrangement
          .map((group, idx) => (
          <button
            key={idx}
            className={`px-4 py-2 ${activeTab === group.full_name ? 'border-b-2 border-blue-500 font-bold' : 'text-gray-500'}`}
            onClick={() => setActiveTab(group.full_name)}
          >
            {group.full_name}
          </button>
        ))}
      </div>

      <table className="w-full text-base border-separate border-spacing-[2px] table-fixed">
        <thead>
          <tr>
            <th className="p-2 sticky left-0 z-10 w-[210px] text-left font-normal text-gray-500"></th>
            {days.map(day => {
               const date = new Date(data.year, data.month - 1, day);
               const isWeekend = date.getDay() === 0 || date.getDay() === 6;
               const isLocked = data.lockdate.includes(day);
               const isHovered = day === hoveredCell.day;
               return (
                <th 
                    key={day} 
                    className={`p-1 font-normal cursor-pointer hover:bg-blue-200 ${isWeekend ? 'bg-red-50' : ''} ${isLocked ? 'bg-gray-300' : ''} ${isHovered ? 'bg-blue-100 ring-2 ring-blue-400 z-20' : ''}`}
                    onClick={(e) => handleDateClick(e, day)}
                >
                  {day}
                </th>
               );
            })}
          </tr>
          <tr>
            <th className="p-2 sticky left-0 z-10 text-left font-normal text-gray-500"></th>
            {onDutyStats.map((ratio, index) => (
              <th key={index} className="p-1 text-sm font-normal text-gray-500">
                {(ratio * 100).toFixed(0)}%
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredGroups.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {group.member.map(member => {
                const person = getPerson(member.alias);
                if (!person) return null;
                const isRowHovered = person.alias === hoveredCell.alias;
                return (
                  <tr key={member.alias} className={`hover:bg-gray-50 ${isRowHovered ? 'bg-blue-50' : ''}`}>
                    <td className={`p-2 sticky left-0 z-10 truncate border-b border-gray-100 ${isRowHovered ? 'bg-blue-100 font-bold border-r-2 border-blue-400' : ''}`} title={person.name}>
                      {person.name} ({person.alias})
                    </td>
                    {days.map(day => {
                      const dayRecord = person.days.find(d => d.day === day);
                      const workType = dayRecord?.workType || 'W';
                      const typeInfo = mapping.dayTypes[workType];
                      const isColHovered = day === hoveredCell.day;
                      const isCellHovered = isRowHovered && isColHovered;
                      
                      return (
                        <td
                          key={day}
                          className={`p-0 ${isColHovered ? 'bg-blue-50' : ''}`}
                          onMouseEnter={() => setHoveredCell({ alias: person.alias, day })}
                          onMouseLeave={() => setHoveredCell({ alias: null, day: null })}
                        >
                          <div
                            className={`w-full h-8 flex items-center justify-center cursor-pointer hover:opacity-80 rounded-sm text-sm ${
                                isCellHovered ? 'ring-2 ring-blue-500 z-30 relative shadow-lg scale-110 transition-transform' : 
                                (isRowHovered || isColHovered) ? 'ring-1 ring-blue-200 z-20 relative' : ''
                            }`}
                            style={{ backgroundColor: getCellColor(workType), color: getTextColor(workType) }}
                            onClick={(e) => handleCellClick(e, person.alias, day, workType, person.name)}
                          >
                            {typeInfo?.tag}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <ShiftModal
        isOpen={!!selectedCell}
        onClose={() => setSelectedCell(null)}
        onSubmit={handleModalSubmit}
        mapping={mapping}
        currentWorkType={selectedCell?.currentWorkType || ''}
        date={`${data.year}-${data.month}-${selectedCell?.day}`}
        personName={selectedCell?.personName || ''}
        initialX={selectedCell?.x || 0}
        initialY={selectedCell?.y || 0}
      />

      {/* Date Lock Popup */}
      {activeDatePopup && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setActiveDatePopup(null)}
          />
          <div 
            className="fixed z-50 bg-white shadow-lg rounded border p-2"
            style={{ 
              left: Math.min(activeDatePopup.x, window.innerWidth - 100), 
              top: activeDatePopup.y + 10 
            }}
          >
            <button
              onClick={handleLockToggle}
              className={`px-4 py-2 rounded text-white text-sm font-bold w-full ${
                data.lockdate.includes(activeDatePopup.day) 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {data.lockdate.includes(activeDatePopup.day) ? 'Unlock' : 'Lock'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
