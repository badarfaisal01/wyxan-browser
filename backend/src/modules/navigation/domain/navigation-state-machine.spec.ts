import { NavigationStateMachine } from './navigation-state-machine';
import { NavigationEntry } from '../../../common/types/navigation.types';

describe('NavigationStateMachine (Pure Domain Engine)', () => {
  const makeEntry = (id: string, address: string, title: string): NavigationEntry => ({
    entryId: id,
    destination: { type: 'site', address },
    title,
    status: 'loaded',
    scrollPosition: 0,
    createdAt: new Date(),
  });

  const entryA = makeEntry('entry-a', 'site-a.zz', 'Site A');
  const entryB = makeEntry('entry-b', 'site-b.zz', 'Site B');
  const entryC = makeEntry('entry-c', 'site-c.zz', 'Site C');
  const entryD = makeEntry('entry-d', 'site-d.zz', 'Site D');
  const entryE = makeEntry('entry-e', 'site-e.zz', 'Site E');

  describe('Direct Navigation & Link Following', () => {
    it('appends a new entry to an empty session and sets currentIndex to 0', () => {
      const result = NavigationStateMachine.navigate([], -1, entryA);
      expect(result.entries).toHaveLength(1);
      expect(result.currentIndex).toBe(0);
      expect(result.targetEntry?.entryId).toBe('entry-a');
      expect(result.changed).toBe(true);
    });

    it('navigates A -> B, making B current at index 1', () => {
      const step1 = NavigationStateMachine.navigate([], -1, entryA);
      const step2 = NavigationStateMachine.navigate(step1.entries, step1.currentIndex, entryB);

      expect(step2.entries).toHaveLength(2);
      expect(step2.currentIndex).toBe(1);
      expect(step2.targetEntry?.entryId).toBe('entry-b');
    });

    it('handles 4-link linear traversal: A -> B -> C -> D', () => {
      let state = NavigationStateMachine.navigate([], -1, entryA);
      state = NavigationStateMachine.navigate(state.entries, state.currentIndex, entryB);
      state = NavigationStateMachine.navigate(state.entries, state.currentIndex, entryC);
      state = NavigationStateMachine.navigate(state.entries, state.currentIndex, entryD);

      expect(state.entries.map((e) => e.destination)).toEqual([
        { type: 'site', address: 'site-a.zz' },
        { type: 'site', address: 'site-b.zz' },
        { type: 'site', address: 'site-c.zz' },
        { type: 'site', address: 'site-d.zz' },
      ]);
      expect(state.currentIndex).toBe(3);
    });
  });

  describe('Back and Forward Transitions', () => {
    let populatedStack: NavigationEntry[];

    beforeEach(() => {
      populatedStack = [entryA, entryB, entryC];
    });

    it('moves backward one step from C to B', () => {
      const result = NavigationStateMachine.back(populatedStack, 2);
      expect(result.currentIndex).toBe(1);
      expect(result.targetEntry?.entryId).toBe('entry-b');
      expect(result.entries).toHaveLength(3); // entries not truncated on back
    });

    it('moves forward one step from B to C', () => {
      const result = NavigationStateMachine.forward(populatedStack, 1);
      expect(result.currentIndex).toBe(2);
      expect(result.targetEntry?.entryId).toBe('entry-c');
    });

    it('is a safe no-op when executing Back at index 0', () => {
      const result = NavigationStateMachine.back(populatedStack, 0);
      expect(result.changed).toBe(false);
      expect(result.currentIndex).toBe(0);
      expect(result.targetEntry?.entryId).toBe('entry-a');
    });

    it('is a safe no-op when executing Forward at the last entry', () => {
      const result = NavigationStateMachine.forward(populatedStack, 2);
      expect(result.changed).toBe(false);
      expect(result.currentIndex).toBe(2);
      expect(result.targetEntry?.entryId).toBe('entry-c');
    });
  });

  describe('Branch Navigation (Truncation after Back)', () => {
    it('truncates forward entries when navigating after Back: A -> B -> C -> D, Back x2 -> B, Navigate E => A -> B -> E', () => {
      // 1. Traverse A -> B -> C -> D
      let state = NavigationStateMachine.navigate([], -1, entryA);
      state = NavigationStateMachine.navigate(state.entries, state.currentIndex, entryB);
      state = NavigationStateMachine.navigate(state.entries, state.currentIndex, entryC);
      state = NavigationStateMachine.navigate(state.entries, state.currentIndex, entryD);
      expect(state.currentIndex).toBe(3);

      // 2. Back twice: D -> C -> B
      state = NavigationStateMachine.back(state.entries, state.currentIndex);
      expect(state.currentIndex).toBe(2); // at C
      state = NavigationStateMachine.back(state.entries, state.currentIndex);
      expect(state.currentIndex).toBe(1); // at B
      expect(state.entries).toHaveLength(4); // C and D still present in forward path

      // 3. Navigate to E from B: C and D must be discarded!
      state = NavigationStateMachine.navigate(state.entries, state.currentIndex, entryE);
      expect(state.entries).toHaveLength(3);
      expect(state.entries.map((e) => e.entryId)).toEqual(['entry-a', 'entry-b', 'entry-e']);
      expect(state.currentIndex).toBe(2);
      expect(NavigationStateMachine.canGoForward(state.currentIndex, state.entries.length)).toBe(false);
      expect(NavigationStateMachine.canGoBack(state.currentIndex)).toBe(true);
    });
  });

  describe('Scroll Position Preservation', () => {
    it('saves departing scroll position on current entry during navigation and restores it on back', () => {
      let state = NavigationStateMachine.navigate([], -1, entryA);

      // User scrolls 350px on entryA and clicks link to entryB
      state = NavigationStateMachine.navigate(state.entries, state.currentIndex, entryB, 350);
      expect(state.entries[0].scrollPosition).toBe(350);

      // User scrolls 120px on entryB and presses Back
      state = NavigationStateMachine.back(state.entries, state.currentIndex, 120);
      expect(state.entries[1].scrollPosition).toBe(120);
      expect(state.targetEntry?.scrollPosition).toBe(350);
    });
  });

  describe('History Jump', () => {
    it('jumps directly to an entry by entryId in the stack', () => {
      const stack = [entryA, entryB, entryC, entryD];
      const result = NavigationStateMachine.jumpToEntry(stack, 3, 'entry-b', 80);

      expect(result.changed).toBe(true);
      expect(result.currentIndex).toBe(1);
      expect(result.targetEntry?.entryId).toBe('entry-b');
      expect(result.entries[3].scrollPosition).toBe(80);
    });
  });
});
