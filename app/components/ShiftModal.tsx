import React, { useState, useEffect, useRef } from 'react';
import { ShiftMapping } from '@/types';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (workType: string) => void;
  mapping: ShiftMapping;
  currentWorkType: string;
  date: string;
  personName: string;
  initialX: number;
  initialY: number;
}

export default function ShiftModal({ isOpen, onClose, onSubmit, mapping, currentWorkType, date, personName, initialX, initialY }: ShiftModalProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Adjust initial position to keep modal within viewport
      const modalWidth = 384; // w-96 = 24rem = 384px
      const modalHeight = 400; // approximate height
      
      let x = initialX;
      let y = initialY;

      if (x + modalWidth > window.innerWidth) {
        x = window.innerWidth - modalWidth - 20;
      }
      if (y + modalHeight > window.innerHeight) {
        y = window.innerHeight - modalHeight - 20;
      }
      
      setPosition({ x, y });
    }
  }, [isOpen, initialX, initialY]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed z-50"
      style={{ left: position.x, top: position.y }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-96 border border-gray-200"
      >
        {/* Header - Draggable Area */}
        <div 
          className="bg-gray-100 p-3 rounded-t-lg cursor-move flex justify-between items-center border-b"
          onMouseDown={handleMouseDown}
        >
          <h2 className="font-bold text-gray-700">Edit Shift</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="p-4">
          <p className="mb-1 text-sm text-gray-600">Date: <span className="font-medium text-gray-900">{date}</span></p>
          <p className="mb-4 text-sm text-gray-600">Person: <span className="font-medium text-gray-900">{personName}</span></p>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            {Object.entries(mapping.dayTypes).map(([key, value]) => {
               // Replicate color logic from ShiftGrid for consistency
               let bgColor = '#e5e7eb';
               let textColor = 'black';
               
               switch (value.color) {
                  case 'green': bgColor = '#4ade80'; break;
                  case 'lime': bgColor = '#a3e635'; break;
                  case 'emerald': bgColor = '#34d399'; break;
                  case 'blue': bgColor = '#60a5fa'; break;
                  case 'fuchsia': bgColor = '#e879f9'; break;
                  case 'pink': bgColor = '#f472b6'; break;
                  case 'rose': bgColor = '#fb7185'; break;
                  case 'yellow': bgColor = '#facc15'; break;
                  case 'amber': bgColor = '#fbbf24'; break;
                  case 'orange': bgColor = '#fb923c'; break;
                  case 'cyan': bgColor = '#22d3ee'; break;
                  case 'indigo': bgColor = '#818cf8'; break;
                  case 'violet': bgColor = '#a78bfa'; break;
                  case 'red': bgColor = '#f87171'; break;
                  default: bgColor = '#e5e7eb';
               }

               if (['emerald', 'blue', 'fuchsia', 'pink', 'rose', 'orange', 'cyan', 'indigo', 'violet', 'red'].includes(value.color)) {
                   textColor = 'white';
               }

               return (
                <button
                  key={key}
                  onClick={() => onSubmit(key)}
                  className={`p-2 border rounded text-sm font-medium transition-all hover:opacity-90 ${
                    currentWorkType === key ? 'ring-2 ring-offset-1 ring-blue-500' : ''
                  }`}
                  style={{ backgroundColor: bgColor, color: textColor }}
                >
                  {value.tag || key}
                  <div className="text-xs font-normal opacity-90 truncate">{value.content}</div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
