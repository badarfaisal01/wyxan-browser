/**
 * Navigation Destination: Either a canonical .zz site or an in-browser search query
 */
export type NavigationDestination =
  | { type: 'site'; address: string }
  | { type: 'search'; query: string; page: number };

export type NavigationStatus = 'loaded' | 'not-found' | 'error';

export type NavigationTransitionSource = 'typed' | 'link' | 'back' | 'forward' | 'history' | 'refresh';

/**
 * A single entry in the active mutable browser navigation stack.
 */
export interface NavigationEntry {
  entryId: string;
  destination: NavigationDestination;
  title: string;
  status: NavigationStatus;
  scrollPosition: number;
  createdAt: Date;
}

/**
 * Persisted active browser session for a specific persona.
 * Single source of truth owned exclusively by the backend.
 */
export interface BrowserSession {
  _id?: string;
  personId: string;
  entries: NavigationEntry[];
  currentIndex: number;
  version: number;
  updatedAt: Date;
}

/**
 * Immutable historical audit record of all visits.
 * Back and Forward transitions must NEVER erase or mutate visit records.
 */
export interface VisitRecord {
  _id?: string;
  personId: string;
  address: string;
  siteId?: string;
  destination: NavigationDestination;
  transition: NavigationTransitionSource;
  outcome: NavigationStatus;
  visitedAt: Date;
}

/**
 * Selectable user browsing persona.
 */
export interface Person {
  _id: string;
  name: string;
  createdAt: Date;
}

/**
 * Published site record with canonical .zz address.
 */
export interface Site {
  _id: string;
  address: string;
  title: string;
  html: string;
  searchableText: string;
  authorId: string;
  authorName?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Derived navigation controls state computed by the backend.
 */
export interface NavigationStateResponse {
  session: BrowserSession;
  currentEntry: NavigationEntry | null;
  canGoBack: boolean;
  canGoForward: boolean;
}
