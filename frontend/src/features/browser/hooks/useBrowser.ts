'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import {
  NavigationDestination,
  NavigationTransitionSource,
  NavigationStateResponse,
} from '@/types/navigation';

export function useBrowser() {
  const queryClient = useQueryClient();
  const [selectedPersonId, setSelectedPersonId] = useState<string>('663675f3a093a1d9426f0001'); // Alice by default
  const [addressDraft, setAddressDraft] = useState<string>('');
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isPublisherOpen, setIsPublisherOpen] = useState<boolean>(false);

  // 1. Fetch available personas
  const { data: people = [], isLoading: isLoadingPeople } = useQuery({
    queryKey: ['people'],
    queryFn: () => apiClient.getPeople(),
  });

  // 2. Fetch authoritative active browser session
  const {
    data: browserState,
    isLoading: isLoadingSession,
    isFetching: isFetchingSession,
    error: sessionError,
  } = useQuery({
    queryKey: ['browserSession', selectedPersonId],
    queryFn: () => apiClient.getSession(selectedPersonId),
    enabled: !!selectedPersonId,
  });

  // 3. Navigation mutation
  const navigateMutation = useMutation({
    mutationFn: async ({
      destination,
      source = 'typed',
      currentScrollPosition,
    }: {
      destination: NavigationDestination;
      source?: NavigationTransitionSource;
      currentScrollPosition?: number;
    }) => {
      const version = browserState?.session.version ?? 1;
      return apiClient.navigate(
        selectedPersonId,
        destination,
        source,
        version,
        currentScrollPosition,
      );
    },
    onSuccess: (newState: NavigationStateResponse) => {
      queryClient.setQueryData(['browserSession', selectedPersonId], newState);
      queryClient.invalidateQueries({ queryKey: ['history', selectedPersonId] });
    },
  });

  // 4. Back mutation
  const backMutation = useMutation({
    mutationFn: async (currentScrollPosition?: number) => {
      const version = browserState?.session.version ?? 1;
      return apiClient.stepBack(selectedPersonId, version, currentScrollPosition);
    },
    onSuccess: (newState: NavigationStateResponse) => {
      queryClient.setQueryData(['browserSession', selectedPersonId], newState);
    },
  });

  // 5. Forward mutation
  const forwardMutation = useMutation({
    mutationFn: async (currentScrollPosition?: number) => {
      const version = browserState?.session.version ?? 1;
      return apiClient.stepForward(selectedPersonId, version, currentScrollPosition);
    },
    onSuccess: (newState: NavigationStateResponse) => {
      queryClient.setQueryData(['browserSession', selectedPersonId], newState);
    },
  });

  // 6. Jump history entry
  const jumpMutation = useMutation({
    mutationFn: async ({
      entryId,
      currentScrollPosition,
    }: {
      entryId: string;
      currentScrollPosition?: number;
    }) => {
      const version = browserState?.session.version ?? 1;
      return apiClient.jumpHistory(
        selectedPersonId,
        entryId,
        version,
        currentScrollPosition,
      );
    },
    onSuccess: (newState: NavigationStateResponse) => {
      queryClient.setQueryData(['browserSession', selectedPersonId], newState);
    },
  });

  return {
    selectedPersonId,
    setSelectedPersonId,
    people,
    isLoadingPeople,
    browserState,
    isLoadingSession,
    isNavigating:
      navigateMutation.isPending ||
      backMutation.isPending ||
      forwardMutation.isPending ||
      jumpMutation.isPending ||
      isFetchingSession,
    sessionError,
    addressDraft,
    setAddressDraft,
    isHistoryOpen,
    setIsHistoryOpen,
    isPublisherOpen,
    setIsPublisherOpen,
    navigate: navigateMutation.mutate,
    goBack: backMutation.mutate,
    goForward: forwardMutation.mutate,
    jumpToEntry: jumpMutation.mutate,
  };
}

