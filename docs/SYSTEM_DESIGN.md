# Wyxan Browser: System Design Document

## 1. Architectural Strategy
- **Modular Monolith:** NestJS backend organized cleanly into domain modules (`navigation`, `sites`, `search`, `people`, `seed`).
- **Single Source of Truth:** Persisted navigation state lives strictly on the backend (`browserSessions` collection) and chronological records live in the append-only `visits` collection.
- **Authoritative Thin Client:** The Next.js frontend renders authoritative state returned from REST mutations and does not maintain unsynchronized local copies.

## 2. Component Architecture
- **Navigation Domain Engine:** Pure, deterministic state machine executing forward path truncation, boundary safety, and scroll position restoration.
- **HTML Sanitization & Isolation:** Multi-layer defense discarding `<script>`, inline event handlers, external frames, and dangerous schemes, rendered in a sandboxed iframe without `allow-scripts`.
- **Search Subsystem:** Full-text indexing across page titles and extracted plain-text body content with query restoration on history rewind.
- **Seed Engine:** Deterministic, idempotent script generating 10+ interconnected `.zz` sites, multiple personas, and realistic visit history.

