import React from 'react';

interface MonthNavigationProps {
  year: number;
  month: number;
  onNavigate: (year: number, month: number) => void;
}

export default function MonthNavigation({ year, month, onNavigate }: MonthNavigationProps) {
  const handlePrev = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth === 0) {
      newMonth = 12;
      newYear = year - 1;
    }
    onNavigate(newYear, newMonth);
  };

  const handleNext = () => {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth === 13) {
      newMonth = 1;
      newYear = year + 1;
    }
    onNavigate(newYear, newMonth);
  };

  return (
    <div className="flex items-center space-x-4 mb-4">
      <button
        onClick={handlePrev}
        className="p-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        &lt; Prev
      </button>
      <h2 className="text-xl font-bold">
        {year} - {month.toString().padStart(2, '0')}
      </h2>
      <button
        onClick={handleNext}
        className="p-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        Next &gt;
      </button>
    </div>
  );
}
