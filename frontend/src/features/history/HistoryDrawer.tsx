'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { X, Clock, ExternalLink, Globe, AlertTriangle } from 'lucide-react';
import { NavigationDestination } from '@/types/navigation';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  personId: string;
  onNavigate: (destination: NavigationDestination) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  personId,
  onNavigate,
}) => {
  const { data: visits = [], isLoading } = useQuery({
    queryKey: ['history', personId],
    queryFn: () => apiClient.getHistory(personId, 100),
    enabled: isOpen,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs select-none">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-10">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2 text-white font-medium text-sm">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Browsing Visit History</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visits List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Loading chronological history...
            </div>
          ) : visits.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No historical visits recorded for this profile yet.
            </div>
          ) : (
            visits.map((visit) => {
              const isNotFound = visit.outcome === 'not-found';
              const dateStr = new Date(visit.visitedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div
                  key={visit._id}
                  onClick={() => {
                    if (visit.destination) {
                      onNavigate(visit.destination);
                      onClose();
                    }
                  }}
                  className="group p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 rounded-xl cursor-pointer transition-all flex items-start justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        isNotFound
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-blue-500/10 text-blue-400'
                      }`}
                    >
                      {isNotFound ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <Globe className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-mono text-xs text-slate-200 group-hover:text-blue-400 truncate flex items-center gap-1.5">
                        <span>{visit.address}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {dateStr}
                        </span>
                        <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded font-sans uppercase">
                          {visit.transition}
                        </span>
                        {isNotFound && (
                          <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800/60 px-1.5 py-0.2 rounded font-sans">
                            404
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
};

