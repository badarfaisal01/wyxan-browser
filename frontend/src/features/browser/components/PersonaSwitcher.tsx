'use client';

import React from 'react';
import { User, Users } from 'lucide-react';
import { Person } from '@/types/navigation';

interface PersonaSwitcherProps {
  people: Person[];
  selectedPersonId: string;
  onSelectPerson: (personId: string) => void;
  isLoading: boolean;
}

export const PersonaSwitcher: React.FC<PersonaSwitcherProps> = ({
  people,
  selectedPersonId,
  onSelectPerson,
  isLoading,
}) => {
  return (
    <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
      <User className="w-3.5 h-3.5 text-blue-400" />
      <span className="font-medium text-slate-400">Profile:</span>
      <select
        value={selectedPersonId}
        onChange={(e) => onSelectPerson(e.target.value)}
        disabled={isLoading || people.length === 0}
        className="bg-transparent text-slate-100 font-medium focus:outline-none cursor-pointer"
      >
        {people.map((p) => (
          <option key={p._id} value={p._id} className="bg-slate-800 text-slate-100">
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
};

