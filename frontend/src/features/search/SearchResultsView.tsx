'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Search, Globe, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { NavigationDestination } from '@/types/navigation';

interface SearchResultsViewProps {
  query: string;
  page: number;
  onNavigate: (destination: NavigationDestination) => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  query,
  page,
  onNavigate,
}) => {
  const { data: searchData, isLoading, error } = useQuery({
    queryKey: ['searchResults', query, page],
    queryFn: () => apiClient.search(query, page),
    enabled: !!query,
  });

  return (
    <div className="flex-1 w-full h-full bg-slate-900 overflow-y-auto p-6 md:p-10 select-text">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Search Header */}
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-mono mb-1">
            <Search className="w-4 h-4" />
            <span>Search Results for &ldquo;{query}&rdquo;</span>
          </div>
          <h1 className="text-xl font-bold text-white">
            {isLoading ? 'Searching...' : `${searchData?.total || 0} pages found`}
          </h1>
        </div>

        {/* Results List */}
        {isLoading ? (
          <div className="py-16 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-rose-400 text-sm">
            Failed to load search results.
          </div>
        ) : searchData?.results.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-base font-medium mb-1">No matches found</p>
            <p className="text-xs text-slate-500">
              Try searching for marine terms like &ldquo;tidepool&rdquo;, &ldquo;coral&rdquo;, &ldquo;kelp&rdquo;, or &ldquo;abyss&rdquo;.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {searchData?.results.map((result) => (
              <article
                key={result._id}
                onClick={() => onNavigate({ type: 'site', address: result.address })}
                className="group bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 rounded-xl p-5 cursor-pointer transition-all shadow-md"
              >
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{result.address}</span>
                </div>
                <h2 className="text-base font-semibold text-blue-400 group-hover:text-blue-300 group-hover:underline mb-2">
                  {result.title}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {result.snippet}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

