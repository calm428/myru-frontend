"use client";
import { useState, ReactNode } from 'react';

interface ExpandableContentProps {
  children: ReactNode;
}

export default function ExpandableContent({ children }: ExpandableContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="relative">
      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-full' : 'max-h-24'}`}>
        <div className="my-3 flex flex-row">
          {children}
        </div>
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"></div>
        )}
      </div>
      <button
        onClick={toggleExpand}
        className="mt-2 text-blue-500 focus:outline-none"
      >
        {isExpanded ? 'Скрыть' : 'Раскрыть'}
      </button>
    </div>
  );
}
