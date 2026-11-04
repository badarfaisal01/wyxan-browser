/**
 * Shared Browser Domain Types (Frontend Authoritative Contracts)
 */

export type NavigationDestination =
  | { type: 'site'; address: string }
  | { type: 'search'; query: string; page: number };

export type NavigationStatus = 'loaded' | 'not-found' | 'error';

export type NavigationTransitionSource = 'typed' | 'link' | 'back' | 'forward' | 'history' | 'refresh';

export interface NavigationEntry {
  entryId: string;
  destination: NavigationDestination;
  title: string;
  status: NavigationStatus;
  scrollPosition: number;
  createdAt: string;
}

export interface BrowserSession {
  _id?: string;
  personId: string;
  entries: NavigationEntry[];
  currentIndex: number;
  version: number;
  updatedAt: string;
}

export interface VisitRecord {
  _id?: string;
  personId: string;
  address: string;
  siteId?: string;
  destination: NavigationDestination;
  transition: NavigationTransitionSource;
  outcome: NavigationStatus;
  visitedAt: string;
}

export interface Person {
  _id: string;
  name: string;
  createdAt: string;
}

export interface Site {
  _id: string;
  address: string;
  title: string;
  html: string;
  searchableText: string;
  authorId: string;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NavigationStateResponse {
  session: BrowserSession;
  currentEntry: NavigationEntry | null;
  canGoBack: boolean;
  canGoForward: boolean;
}

export interface SearchResultItem {
  _id: string;
  address: string;
  title: string;
  snippet: string;
  score?: number;
}

export interface SearchResultsResponse {
  query: string;
  page: number;
  total: number;
  results: SearchResultItem[];
}
