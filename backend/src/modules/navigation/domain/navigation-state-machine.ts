import {
  NavigationDestination,
  NavigationEntry,
  NavigationStatus,
} from '../../../common/types/navigation.types';

export interface StateMachineResult {
  entries: NavigationEntry[];
  currentIndex: number;
  changed: boolean;
  targetEntry: NavigationEntry | null;
}

/**
 * Pure domain state machine governing browser navigation invariants.
 * Independent of database, network, or UI frameworks.
 */
export class NavigationStateMachine {
  /**
   * Evaluates if Back button is active
   */
  static canGoBack(currentIndex: number): boolean {
    return currentIndex > 0;
  }

  /**
   * Evaluates if Forward button is active
   */
  static canGoForward(currentIndex: number, totalEntries: number): boolean {
    return currentIndex >= 0 && currentIndex < totalEntries - 1;
  }

  /**
   * Creates a standardized NavigationEntry
   */
  static createEntry(params: {
    destination: NavigationDestination;
    title: string;
    status: NavigationStatus;
    scrollPosition?: number;
    entryId?: string;
  }): NavigationEntry {
    return {
      entryId: params.entryId || `entry-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      destination: params.destination,
      title: params.title,
      status: params.status,
      scrollPosition: params.scrollPosition || 0,
      createdAt: new Date(),
    };
  }

  /**
   * Navigation to a new destination (typed address or followed link).
   * Rules:
   * 1. Preserves scroll position on the departing entry.
   * 2. Truncates any forward path after currentIndex.
   * 3. Appends newEntry.
   * 4. Updates currentIndex to point to the new entry.
   */
  static navigate(
    entries: NavigationEntry[],
    currentIndex: number,
    newEntry: NavigationEntry,
    currentScrollPosition?: number,
  ): StateMachineResult {
    // 1. Clone entries array to maintain immutability
    const updatedEntries = entries.map((entry, idx) => {
      if (idx === currentIndex && typeof currentScrollPosition === 'number') {
        return { ...entry, scrollPosition: currentScrollPosition };
      }
      return entry;
    });

    // 2. Truncate forward history
    const retained =
      currentIndex >= 0 && currentIndex < updatedEntries.length
        ? updatedEntries.slice(0, currentIndex + 1)
        : [...updatedEntries];

    // 3. Append new entry
    retained.push(newEntry);

    return {
      entries: retained,
      currentIndex: retained.length - 1,
      changed: true,
      targetEntry: newEntry,
    };
  }

  /**
   * Back navigation transition.
   * Rules:
   * 1. If at start (currentIndex <= 0), safe no-op.
   * 2. Save scroll position on current entry.
   * 3. Decrement currentIndex by 1.
   * 4. Forward path is preserved.
   */
  static back(
    entries: NavigationEntry[],
    currentIndex: number,
    currentScrollPosition?: number,
  ): StateMachineResult {
    if (!this.canGoBack(currentIndex)) {
      return {
        entries,
        currentIndex,
        changed: false,
        targetEntry: entries[currentIndex] || null,
      };
    }

    const updatedEntries = entries.map((entry, idx) => {
      if (idx === currentIndex && typeof currentScrollPosition === 'number') {
        return { ...entry, scrollPosition: currentScrollPosition };
      }
      return entry;
    });

    const newIndex = currentIndex - 1;
    return {
      entries: updatedEntries,
      currentIndex: newIndex,
      changed: true,
      targetEntry: updatedEntries[newIndex] || null,
    };
  }

  /**
   * Forward navigation transition.
   * Rules:
   * 1. If at end (currentIndex >= entries.length - 1), safe no-op.
   * 2. Save scroll position on current entry.
   * 3. Increment currentIndex by 1.
   */
  static forward(
    entries: NavigationEntry[],
    currentIndex: number,
    currentScrollPosition?: number,
  ): StateMachineResult {
    if (!this.canGoForward(currentIndex, entries.length)) {
      return {
        entries,
        currentIndex,
        changed: false,
        targetEntry: entries[currentIndex] || null,
      };
    }

    const updatedEntries = entries.map((entry, idx) => {
      if (idx === currentIndex && typeof currentScrollPosition === 'number') {
        return { ...entry, scrollPosition: currentScrollPosition };
      }
      return entry;
    });

    const newIndex = currentIndex + 1;
    return {
      entries: updatedEntries,
      currentIndex: newIndex,
      changed: true,
      targetEntry: updatedEntries[newIndex] || null,
    };
  }

  /**
   * Jump to a specific entry in the active session stack.
   */
  static jumpToEntry(
    entries: NavigationEntry[],
    currentIndex: number,
    targetEntryId: string,
    currentScrollPosition?: number,
  ): StateMachineResult {
    const targetIndex = entries.findIndex((e) => e.entryId === targetEntryId);
    if (targetIndex === -1 || targetIndex === currentIndex) {
      return {
        entries,
        currentIndex,
        changed: false,
        targetEntry: entries[currentIndex] || null,
      };
    }

    const updatedEntries = entries.map((entry, idx) => {
      if (idx === currentIndex && typeof currentScrollPosition === 'number') {
        return { ...entry, scrollPosition: currentScrollPosition };
      }
      return entry;
    });

    return {
      entries: updatedEntries,
      currentIndex: targetIndex,
      changed: true,
      targetEntry: updatedEntries[targetIndex] || null,
    };
  }
}

