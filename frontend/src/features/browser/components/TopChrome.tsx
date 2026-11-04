'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  ShieldCheck,
  Search,
  History,
  PenSquare,
  Globe,
  Loader2,
} from 'lucide-react';
import { PersonaSwitcher } from './PersonaSwitcher';
import { NavigationDestination, Person } from '@/types/navigation';

interface TopChromeProps {
  currentAddress: string;
  canGoBack: boolean;
  canGoForward: boolean;
  isNavigating: boolean;
  people: Person[];
  selectedPersonId: string;
  onSelectPerson: (id: string) => void;
  isLoadingPeople: boolean;
  onNavigate: (destination: NavigationDestination) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onToggleHistory: () => void;
  onTogglePublisher: () => void;
}

export const TopChrome: React.FC<TopChromeProps> = ({
  currentAddress,
  canGoBack,
  canGoForward,
  isNavigating,
  people,
  selectedPersonId,
  onSelectPerson,
  isLoadingPeople,
  onNavigate,
  onGoBack,
  onGoForward,
  onToggleHistory,
  onTogglePublisher,
}) => {
  const [inputVal, setInputVal] = useState<string>(currentAddress || '');

  // Synchronize input draft when current authoritative address changes
  useEffect(() => {
    setInputVal(currentAddress || '');
  }, [currentAddress]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = inputVal.trim();
    if (!raw) return;

    // If starts with "search:" or doesn't look like a domain, handle appropriately
    if (raw.startsWith('search:') || (!raw.includes('.zz') && raw.includes(' '))) {
      const q = raw.replace(/^search:\s*/, '');
      onNavigate({ type: 'search', query: q, page: 1 });
    } else {
      onNavigate({ type: 'site', address: raw });
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex flex-col gap-2 select-none">
      {/* Top Bar: Controls + Omnibox + Tools */}
      <div className="flex items-center gap-3">
        {/* Navigation Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onGoBack}
            disabled={!canGoBack || isNavigating}
            title="Click to go back"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onGoForward}
            disabled={!canGoForward || isNavigating}
            title="Click to go forward"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (currentAddress) onNavigate({ type: 'site', address: currentAddress });
            }}
            disabled={isNavigating}
            title="Reload current page"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {isNavigating ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            ) : (
              <RotateCw className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => onNavigate({ type: 'site', address: 'tidepool.zz' })}
            disabled={isNavigating}
            title="Browser Home (tidepool.zz)"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* Omnibox / Address Bar Form */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-3xl">
          <div className="relative flex items-center bg-slate-950/80 border border-slate-700/80 focus-within:border-blue-500 rounded-xl px-3 py-1.5 text-xs text-slate-100 shadow-inner transition-all">
            <div className="flex items-center gap-1.5 text-emerald-400 mr-2 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] bg-emerald-950/80 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/60">
                .zz
              </span>
            </div>

            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter internal address (e.g. coral-reef.zz) or search..."
              className="bg-transparent flex-1 focus:outline-none text-slate-200 font-mono text-xs placeholder:text-slate-500"
            />

            {isNavigating && (
              <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0 ml-2" />
            )}
          </div>
        </form>

        {/* Browser Utilities (History, Publisher, Persona Switcher) */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onToggleHistory}
            title="Toggle Visit History"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">History</span>
          </button>

          <button
            onClick={onTogglePublisher}
            title="Publish New .zz Page"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs px-2.5 py-1.5 rounded-lg shadow font-medium transition-colors"
          >
            <PenSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Publish</span>
          </button>

          <PersonaSwitcher
            people={people}
            selectedPersonId={selectedPersonId}
            onSelectPerson={onSelectPerson}
            isLoading={isLoadingPeople}
          />
        </div>
      </div>
    </header>
  );
};
