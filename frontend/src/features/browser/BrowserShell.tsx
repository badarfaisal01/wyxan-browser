'use client';

import React from 'react';
import { useBrowser } from './hooks/useBrowser';
import { TopChrome } from './components/TopChrome';
import { IframeViewer } from './components/IframeViewer';
import { NotFoundView } from './components/NotFoundView';
import { ErrorView } from './components/ErrorView';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Loader2 } from 'lucide-react';

export const BrowserShell: React.FC = () => {
  const {
    selectedPersonId,
    setSelectedPersonId,
    people,
    isLoadingPeople,
    browserState,
    isLoadingSession,
    isNavigating,
    sessionError,
    isHistoryOpen,
    setIsHistoryOpen,
    isPublisherOpen,
    setIsPublisherOpen,
    navigate,
    goBack,
    goForward,
  } = useBrowser();

  const currentEntry = browserState?.currentEntry;
  const isSiteDestination = currentEntry?.destination.type === 'site';
  const currentAddress = isSiteDestination ? currentEntry.destination.address : '';

  // Fetch site content if active destination is a site
  const {
    data: siteData,
    isLoading: isLoadingSite,
    error: siteError,
    refetch: refetchSite,
  } = useQuery({
    queryKey: ['siteContent', currentAddress],
    queryFn: () => apiClient.resolveSite(currentAddress),
    enabled: isSiteDestination && !!currentAddress && currentEntry.status === 'loaded',
    retry: 0,
  });

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans">
      {/* 1. Top Browser Chrome (Omnibox, Navigation, Tools) */}
      <TopChrome
        currentAddress={currentAddress}
        canGoBack={browserState?.canGoBack ?? false}
        canGoForward={browserState?.canGoForward ?? false}
        isNavigating={isNavigating || isLoadingSite}
        people={people}
        selectedPersonId={selectedPersonId}
        onSelectPerson={setSelectedPersonId}
        isLoadingPeople={isLoadingPeople}
        onNavigate={(dest) => navigate({ destination: dest })}
        onGoBack={() => goBack(currentEntry?.scrollPosition)}
        onGoForward={() => goForward(currentEntry?.scrollPosition)}
        onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        onTogglePublisher={() => setIsPublisherOpen(!isPublisherOpen)}
      />

      {/* 2. Main Browser Viewport */}
      <main className="flex-1 relative flex flex-col overflow-hidden">
        {isLoadingSession ? (
          <div className="flex-1 flex items-center justify-center bg-slate-900">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : sessionError ? (
          <ErrorView
            message="Failed to connect to the browser navigation backend service."
            onRetry={() => window.location.reload()}
          />
        ) : currentEntry?.status === 'not-found' ? (
          <NotFoundView
            address={currentAddress}
            canGoBack={browserState?.canGoBack ?? false}
            onGoBack={() => goBack(currentEntry?.scrollPosition)}
            onSearch={(q) => navigate({ destination: { type: 'search', query: q, page: 1 } })}
          />
        ) : isSiteDestination && siteData ? (
          <IframeViewer
            html={siteData.html}
            address={siteData.address}
            scrollPosition={currentEntry.scrollPosition}
            onNavigate={(dest, scroll) =>
              navigate({ destination: dest, source: 'link', currentScrollPosition: scroll })
            }
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-900 text-slate-500 text-sm">
            Ready to browse.
          </div>
        )}
      </main>
    </div>
  );
};
