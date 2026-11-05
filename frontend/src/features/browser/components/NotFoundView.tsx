'use client';

import React from 'react';
import { AlertCircle, ArrowLeft, Search, Globe } from 'lucide-react';

interface NotFoundViewProps {
  address: string;
  canGoBack: boolean;
  onGoBack: () => void;
  onSearch: (q: string) => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  address,
  canGoBack,
  onGoBack,
  onSearch,
}) => {
  return (
    <div className="flex-1 w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-white mb-2">Address Not Found</h2>

        <p className="text-slate-300 text-sm mb-4">
          The internal address <code className="bg-slate-900 text-rose-300 px-2 py-0.5 rounded font-mono text-xs border border-slate-700">{address}</code> does not exist on the Wyxan network.
        </p>

        <p className="text-slate-400 text-xs mb-6">
          The address may be broken, misspelled, or the page author has not published it yet.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {canGoBack && (
            <button
              onClick={onGoBack}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          )}

          <button
            onClick={() => onSearch(address.replace(/\.zz$/, ''))}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-600 transition-colors"
          >
            <Search className="w-4 h-4" />
            Search for &ldquo;{address.replace(/\.zz$/, '')}&rdquo;
          </button>
        </div>
      </div>
    </div>
  );
};

