# Wyxan Browser: Navigation State Machine Rules

All transitions pass through `NavigationStateMachine` (`backend/src/modules/navigation/domain/navigation-state-machine.ts`):

### 1. Direct Navigation / Follow Link
- Strips any existing forward path after `currentIndex`: `entries.slice(0, currentIndex + 1)`.
- Preserves departing scroll position on current entry.
- Appends `newEntry` and sets `currentIndex = entries.length - 1`.
- Appends an immutable record to the `visits` collection.

### 2. Back Navigation
- Safe no-op if `currentIndex <= 0`.
- Decrements `currentIndex` by 1.
- Retains existing forward path.
- Does NOT append to entries or modify visit history.

### 3. Forward Navigation
- Safe no-op if `currentIndex >= entries.length - 1`.
- Increments `currentIndex` by 1.

### 4. Branching Transition
- Starting from `A -> B -> C -> D`, pressing Back x2 moves pointer to `B`.
- Navigating to `E` truncates `C` and `D` from active path, producing `A -> B -> E`.
- The historical visit records for `C` and `D` remain intact.

### 5. Address Not Found (404)
- Non-existent `.zz` addresses generate a `not-found` navigation entry in the stack.
- Pressing Back returns smoothly to the previous valid site.

