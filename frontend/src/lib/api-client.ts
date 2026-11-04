import {
  Person,
  NavigationStateResponse,
  VisitRecord,
  Site,
  SearchResultsResponse,
  NavigationDestination,
  NavigationTransitionSource,
} from '@/types/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private activeAbortController: AbortController | null = null;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    cancelPrevious = false,
  ): Promise<T> {
    if (cancelPrevious && this.activeAbortController) {
      this.activeAbortController.abort();
    }

    const controller = new AbortController();
    if (cancelPrevious) {
      this.activeAbortController = controller;
    }

    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = Array.isArray(errorData.message)
              ? errorData.message.join(', ')
              : errorData.message;
          }
        } catch {
          // Response body was not JSON
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } finally {
      if (cancelPrevious && this.activeAbortController === controller) {
        this.activeAbortController = null;
      }
    }
  }

  // People
  async getPeople(): Promise<Person[]> {
    return this.request<Person[]>('/people');
  }

  // Browser Session
  async getSession(personId: string): Promise<NavigationStateResponse> {
    return this.request<NavigationStateResponse>(`/browser/${personId}`);
  }

  // Navigation transitions (cancelPrevious = true to prevent stale race conditions)
  async navigate(
    personId: string,
    destination: NavigationDestination,
    source: NavigationTransitionSource,
    expectedVersion: number,
    currentScrollPosition?: number,
  ): Promise<NavigationStateResponse> {
    return this.request<NavigationStateResponse>(
      `/browser/${personId}/navigate`,
      {
        method: 'POST',
        body: JSON.stringify({
          destination,
          source,
          expectedVersion,
          currentScrollPosition,
        }),
      },
      true,
    );
  }

  async stepBack(
    personId: string,
    expectedVersion: number,
    currentScrollPosition?: number,
  ): Promise<NavigationStateResponse> {
    return this.request<NavigationStateResponse>(
      `/browser/${personId}/back`,
      {
        method: 'POST',
        body: JSON.stringify({
          expectedVersion,
          currentScrollPosition,
        }),
      },
      true,
    );
  }

  async stepForward(
    personId: string,
    expectedVersion: number,
    currentScrollPosition?: number,
  ): Promise<NavigationStateResponse> {
    return this.request<NavigationStateResponse>(
      `/browser/${personId}/forward`,
      {
        method: 'POST',
        body: JSON.stringify({
          expectedVersion,
          currentScrollPosition,
        }),
      },
      true,
    );
  }

  async jumpHistory(
    personId: string,
    entryId: string,
    expectedVersion: number,
    currentScrollPosition?: number,
  ): Promise<NavigationStateResponse> {
    return this.request<NavigationStateResponse>(
      `/browser/${personId}/history/${entryId}`,
      {
        method: 'POST',
        body: JSON.stringify({
          expectedVersion,
          currentScrollPosition,
        }),
      },
      true,
    );
  }

  // History ledger
  async getHistory(personId: string, limit = 50, skip = 0): Promise<VisitRecord[]> {
    return this.request<VisitRecord[]>(`/browser/${personId}/history?limit=${limit}&skip=${skip}`);
  }

  // Sites & Publishing
  async resolveSite(address: string): Promise<Site> {
    return this.request<Site>(`/sites/${encodeURIComponent(address)}`);
  }

  async publishSite(payload: {
    address: string;
    title: string;
    html: string;
    authorId: string;
  }): Promise<Site> {
    return this.request<Site>('/sites', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Search
  async search(query: string, page = 1): Promise<SearchResultsResponse> {
    return this.request<SearchResultsResponse>(
      `/sites/search?q=${encodeURIComponent(query)}&page=${page}`,
    );
  }
}

export const apiClient = new ApiClient();
