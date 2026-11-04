# Wyxan Browser: Phased Implementation Plan & Commit Roadmap

This implementation plan breaks down the entire development lifecycle of the **Wyxan Web Browser** into **8 structured phases** with **26 atomic, verifiable commits**. Each commit represents a testable, functional step adhering to Conventional Commits.

---

## 🗺️ Roadmap Overview

| Phase | Focus Area | Planned Commits |
| :--- | :--- | :---: |
| **Phase 1** | Monorepo Scaffolding & Infrastructure | 4 commits |
| **Phase 2** | Database Layer & Deterministic Seed Engine | 3 commits |
| **Phase 3** | Backend Navigation Engine & State Machine | 4 commits |
| **Phase 4** | Site Resolution, HTML Sanitizer & Publishing API | 3 commits |
| **Phase 5** | Full-Text Search Subsystem & Integration | 2 commits |
| **Phase 6** | Next.js Frontend Shell & Sandboxed Viewport | 4 commits |
| **Phase 7** | Frontend Features: History, Search & Publisher | 3 commits |
| **Phase 8** | E2E Playwright Testing & Verification Runbook | 3 commits |
| **Total** | | **26 Commits** |

---

## 📋 Granular Phase Breakdown

### Phase 1: Monorepo Scaffolding & Infrastructure (Commits 1–4)
- **Commit 1: `chore: setup monorepo structure and docker compose for mongodb`**
  - Root `package.json` with npm workspaces or concurrent dev scripts.
  - `docker-compose.yml` for local MongoDB instance.
  - `docs/IMPLEMENTATION_PLAN.md` committed.
- **Commit 2: `feat(backend): scaffold NestJS application with config and swagger`**
  - Initialize NestJS project in `backend/` with TypeScript, validation pipes, and Swagger/OpenAPI setup.
  - Environment configuration (`.env.example`).
- **Commit 3: `feat(frontend): scaffold Next.js app with Tailwind CSS and TanStack Query`**
  - Initialize Next.js 14+ App Router in `frontend/`.
  - Tailwind CSS setup, Lucide icons, and TanStack Query provider boilerplate.
- **Commit 4: `feat(shared): define core TypeScript DTOs and API contract interfaces`**
  - Shared domain interfaces: `Person`, `Site`, `BrowserSession`, `NavigationEntry`, `Visit`.
  - Navigation request/response contracts and address format constants (`.zz`).

---

### Phase 2: Database Layer & Deterministic Seed Engine (Commits 5–7)
- **Commit 5: `feat(database): implement Mongoose schemas with compound indexes`**
  - `PersonSchema` (`_id`, `name`, `createdAt`).
  - `SiteSchema` with unique index on `address`, text index on `title` + `searchableText`.
  - `BrowserSessionSchema` with unique index on `personId` and version field for optimistic locking.
  - `VisitSchema` with compound index on `(personId, visitedAt desc)`.
- **Commit 6: `feat(sites): add address canonicalization and validation utility`**
  - Normalization engine (`Tidepool.ZZ` → `tidepool.zz`, trim, regex validation).
  - Validation guards ensuring only valid `.zz` internal domains are processed.
- **Commit 7: `feat(seed): create deterministic and idempotent database seed script`**
  - 3 browsing personas (Alice, Bob, Charlie).
  - 10+ realistic `.zz` pages (hyperlinks between each other, broken links, varying content).
  - Pre-seeded realistic visit trails and initial session stacks.
  - Safe to execute multiple times (`upsert` pattern, zero duplicates).

---

### Phase 3: Backend Navigation Engine & State Machine (Commits 8–11)
- **Commit 8: `feat(navigation): implement pure domain navigation state machine`**
  - Pure function `navigate(entries, currentIndex, newEntry)`: forward path truncation.
  - Step transitions: `back()` and `forward()` with boundary safety (no-op at limits).
  - `not-found` entry generation for dead links.
- **Commit 9: `test(navigation): add unit test suite for navigation state transitions`**
  - Verify A → B → C → D traversal.
  - Verify A → B → C → Back x2 → E truncates forward path to A → B → E while preserving visits.
  - Verify boundary no-ops and scroll position persistence per entry.
- **Commit 10: `feat(navigation): build session persistence service with optimistic locking`**
  - Session version verification (`expectedVersion`) preventing race conditions.
  - Coordinated persistence: session update + immutable `visits` record insertion.
- **Commit 11: `feat(navigation): expose REST navigation controllers and history endpoints`**
  - `GET /browser/:personId`: retrieve active session and entries.
  - `POST /browser/:personId/navigate`: handle address navigation.
  - `POST /browser/:personId/back`: navigate backward.
  - `POST /browser/:personId/forward`: navigate forward.
  - `POST /browser/:personId/history/:entryId`: jump to specific history entry.
  - `GET /browser/:personId/history`: chronological immutable audit log.

---

### Phase 4: Site Resolution, HTML Sanitizer & Publishing API (Commits 12–14)
- **Commit 12: `feat(security): implement defense-in-depth HTML sanitizer and extractor`**
  - Strip `<script>`, inline event handlers (`onload`, `onclick`), external CSS/fonts, dangerous protocols (`javascript:`, `data:`).
  - Plain-text extraction engine creating `searchableText` from HTML content.
- **Commit 13: `test(security): add test suite for XSS prevention and sanitization edge cases`**
  - Unit tests for malicious vectors: nested tags, clobbered DOM attributes, obscure event attributes, and unencoded URI attacks.
- **Commit 14: `feat(sites): implement site publishing and address resolution endpoints`**
  - `POST /sites`: validate address, sanitize HTML, extract text, store site.
  - `GET /sites/:address`: resolve canonical site with 404 handling.

---

### Phase 5: Full-Text Search Subsystem (Commits 15–16)
- **Commit 15: `feat(search): implement full-text search across titles and body text`**
  - `GET /sites/search?q=`: MongoDB text index query with score weighting (title priority).
  - Pagination and highlighted excerpt generation.
- **Commit 16: `feat(navigation): integrate search queries as first-class navigation destinations`**
  - Support `{ type: "search", query, page }` in the navigation stack so Back/Forward accurately restores search results.

---

### Phase 6: Next.js Frontend Shell & Sandboxed Viewport (Commits 17–20)
- **Commit 17: `feat(frontend): build API client layer and persona switcher`**
  - Typed API client with request cancellation to prevent stale async responses.
  - Persona switcher dropdown updating active `personId`.
- **Commit 18: `feat(frontend): implement browser top chrome and omnibox`**
  - Back, Forward (with disabled state based on `canGoBack`/`canGoForward`), Refresh, and Home buttons.
  - Address bar with submit on enter, draft state vs confirmed URL synchronization.
- **Commit 19: `feat(frontend): implement sandboxed iframe viewer with link interception`**
  - `<iframe sandbox="allow-same-origin">` (no `allow-scripts`, no `allow-top-navigation`).
  - Strict internal `.zz` click interception dispatching navigation API calls to parent app.
  - Scroll position restoration on navigation returns.
- **Commit 20: `feat(frontend): create loading, error, and 404 not-found browser views`**
  - Native browser-like error pages for 404 (with "Go Back" action) and network failures.
  - Progress bar / spinner for inflight transitions.

---

### Phase 7: History, Search UI & Web Publisher (Commits 21–23)
- **Commit 21: `feat(frontend): implement chronological history drawer`**
  - Per-person sliding drawer with timestamped visit ledger.
  - Visual distinction between direct navigation, links, and history jumps.
- **Commit 22: `feat(frontend): build search results page and query restoration`**
  - Search results view with match highlighting, result cards, and click-to-navigate.
- **Commit 23: `feat(frontend): build site publisher modal with live preview`**
  - Authoring modal for `.zz` sites with address validation, HTML editor, and preview before publishing.

---

### Phase 8: Automated Verification, E2E Tests & Runbook (Commits 24–26)
- **Commit 24: `test(e2e): implement Playwright test suite for core navigation journeys`**
  - Journey 1: Type address and record visit.
  - Journey 2: 4-link linear traversal (`A → B → C → D`).
  - Journey 3: Back, Forward, and Branch navigation (`A → B → C → Back x2 → D`).
  - Journey 4: Broken address recovery via Back button.
- **Commit 25: `test(e2e): implement Playwright test suite for persona, search and publishing`**
  - Journey 5: Search and return with query preservation.
  - Journey 6: Publish HTML site and navigate via internal link.
  - Journey 7: Profile switching with independent session isolation.
- **Commit 26: `docs: add comprehensive verification runbook and final documentation`**
  - Complete startup instructions, seed instructions, test commands, and architectural summary in `docs/`.
