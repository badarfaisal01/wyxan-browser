# Wyxan Browser: Verification Runbook & Demo Walkthrough

This runbook guides technical reviewers and evaluators through verifying all 7 critical browser user journeys and running the test suite.

---

## 🛠️ 1. Environment Setup

```bash
# 1. Start MongoDB (via Docker Compose or local mongod)
docker compose up -d

# 2. Seed Deterministic Test Data (10+ sites, 3 personas, 1hr visit activity)
cd backend
npm run seed

# 3. Start NestJS Backend (Runs on http://localhost:3001)
npm run start:dev

# 4. In a second terminal, start Next.js Frontend (Runs on http://localhost:3000)
cd frontend
npm run dev
```

---

## 🧪 2. Running Automated Tests

```bash
# Backend Domain Unit Tests (Pure Navigation State Machine & Security Sanitizer)
cd backend
npm test

# Playwright End-to-End User Journeys (Chromium)
cd ..
npx playwright test
```

---

## 🎬 3. Four-to-Five-Minute Walkthrough Script

| Step | User Action | Expected Behavior |
| :--- | :--- | :--- |
| **1. Direct Navigation** | Enter `tidepool.zz` in omnibox and press Enter | Tidepool Ecosystem Hub loads in the sandboxed iframe; a new visit is appended to the History drawer. |
| **2. Link Traversal** | Click "Visit the Coral Reef Sanctuary" then "Meet the Starfish of the Reef" | Linear traversal (`tidepool.zz` → `coral-reef.zz` → `starfish.zz`). Address bar and page update. |
| **3. Back & Forward** | Click Back button twice, then Forward once | Navigates back to Coral Reef, then Tidepool, then back forward to Coral Reef. Scroll positions are preserved. |
| **4. Branch Navigation** | From Coral Reef, click Back to Tidepool, then click "Dive into Giant Kelp Forest" | Active path becomes `tidepool.zz` → `kelp-forest.zz`. Forward button becomes disabled (previous forward branch truncated). |
| **5. Broken Link / 404** | Click "Explore Sunken Ruins" (`sunken-ruins.zz`) | Visual 404 screen appears. Click "Go Back" to immediately restore Tidepool. |
| **6. Full-Content Search** | In omnibox, type `search: coral` or click search button | Results view opens displaying matching `.zz` pages with snippets. Click result, then click Back to verify query restoration. |
| **7. Self-Publishing** | Click "Publish", enter `atlantis.zz`, a title, and HTML with an internal link, then click "Publish Page" | Address is validated, HTML is sanitized, site is indexed, and browser navigates to the new page. |
| **8. Profile Switching** | Switch profile dropdown from "Alice" to "Bob Deepdiver" | Bob's independent session (`deep-trench.zz`) and distinct historical audit trail load instantly. |
