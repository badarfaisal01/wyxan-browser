'use client';

import React from 'react';
import { WifiOff, RotateCw } from 'lucide-react';

interface ErrorViewProps {
  message: string;
  onRetry: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({ message, onRetry }) => {
  return (
    <div className="flex-1 w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-2xl p-8 shadow-2xl">
        <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-amber-400">
          <WifiOff className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-white mb-2">Connection Problem</h2>
        <p className="text-slate-300 text-sm mb-6">{message}</p>

        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-colors mx-auto shadow-lg shadow-blue-600/20"
        >
          <RotateCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
};

