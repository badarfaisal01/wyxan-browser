# Project Rules & Development Guidelines: Wyxan Browser

## 1. Mandatory Auto-Commit & Push Workflow
- **Continuous Version Control:** Whenever an agent finishes a meaningful step, file modification, feature addition, bug fix, or milestone, it **MUST automatically stage, commit, and push** the changes to GitHub (`origin main`).
- **Conventional Commits:** Use structured, informative commit messages following conventional commit prefixes:
  - `feat(...)`: New functionality (e.g. navigation engine, session manager, iframe viewer)
  - `fix(...)`: Bug fixes or corrections
  - `docs(...)`: Documentation or design plan updates
  - `refactor(...)`: Code refactoring without changing behavior
  - `test(...)`: Adding or updating tests
  - `chore(...)`: Dependencies, project configuration, tooling
- **Granular History:** Keep commits atomic so every stage of development is tracked clearly in the GitHub commit history.
- **Verification Before Push:** Ensure syntax/type checks and tests pass before committing.

---

## 2. Architecture & Domain Rules
- **Modular Monolith:** Keep the NestJS backend structured into domain modules (`navigation`, `sites`, `search`, `people`, `seed`). Avoid distributed microservices.
- **Single Source of Truth:**
  - The backend owns all persisted navigation state (`browserSessions`) and historical records (`visits`).
  - The Next.js frontend renders authoritative state received from the backend and does not maintain duplicate out-of-sync navigation copies.
- **Navigation Domain Engine:**
  - Route all Back, Forward, link clicks, and history jumps through the single domain navigation service.
  - New navigation after a Back operation MUST truncate forward entries while leaving prior visit history intact.
  - Edge cases (Back at index 0, Forward at end) must be safe no-ops.
  - "Not Found" destinations must be explicitly recorded in the navigation stack so Back works predictably.
- **Separate Entries from Visits:**
  - `browserSessions.entries`: Mutable active navigation stack (can be truncated on branch).
  - `visits`: Immutable append-only historical audit trail. Moving backward must never erase visit records.
- **Address Canonicalization:**
  - Always validate and normalize `.zz` internal addresses on the backend (e.g. `Tidepool.ZZ` → `tidepool.zz`).

---

## 3. Security & HTML Isolation
- **Hostile Input Principle:** Treat all user-published HTML as untrusted.
- **Sanitization Pipeline:** Strip `<script>`, inline event handlers (`onload`, `onclick`, etc.), external resources, and unsafe schemes (`javascript:`, `data:`).
- **Isolated Rendering:** Render content inside an isolated `<iframe sandbox="allow-same-origin">` without `allow-scripts` or `allow-top-navigation`.
- **Internal Link Interception:** Only permit internal `.zz` link navigation; route clicks back through the application navigation API.

---

## 4. Coding & Quality Standards
- **Strict TypeScript:** No `any` types. Define strict DTOs and interfaces for all API payloads.
- **State Handling:** Always handle loading, empty, error, and not-found states gracefully in the UI.
- **Deterministic Seed Data:** All database seed scripts must be idempotent (safe to run multiple times without duplicating records).
- **Automated Verification:** Run unit, integration, and Playwright E2E tests before concluding major milestones.

