# AI Coding Agent Protocol & Context Maintenance Guide

> **Notice to AI Model:** You are building and maintaining the Poultry Farm Management System. You must strictly follow the memory preservation and documentation protocols defined here to ensure seamless handoffs between sessions.

---

## 1. The Core AI Rule: "Project Progress File"

Before and after performing any code changes, you **must maintain and update** a single file in the project root:
`PROJECT_PROGRESS.md`

### Why This File Exists:
Different AI models and chat contexts have limited context windows and wipe memory between sessions. `PROJECT_PROGRESS.md` acts as your long-term external brain. It informs the next AI:
1. Exactly what features are implemented and working.
2. What is currently being built.
3. **Crucial:** Special errors encountered and the exact fixes applied so subsequent models do not regress or repeat mistakes.

---

## 2. Standard Structure for `PROJECT_PROGRESS.md`

Whenever you start or finish a task, ensure `PROJECT_PROGRESS.md` follows this exact template:

```markdown
# Project Status & AI Memory Log

## Current Tech Stack
- Frontend: Next.js (App Router) / React / Tailwind CSS
- PWA / Offline: @serwist/next or vite-plugin-pwa + Dexie.js (IndexedDB)
- Backend / Database: Supabase / PostgreSQL
- State Management: TanStack React Query

## Implemented & Verified Features
- [x] Database migrations created for Farms, Sheds, Flocks, Daily Logs, Audit Trail, Expenses.
- [x] Multi-farm selector and overview screen.

## In Progress / Next Up
- [ ] Offline Sync queue using Dexie.js for daily logs.
- [ ] Audit trail modal prompting mandatory edit reason.

## Known Gotchas & Resolved Bugs (DO NOT REPEAT)
### 1. IndexedDB Date Deserialization in Safari
- **Issue:** Safari throws an `Invalid Date` error when querying IndexedDB with raw ISO strings.
- **Resolution:** Always serialize dates to `YYYY-MM-DD` strings before persisting to Dexie. Never store raw `Date()` objects in the local offline table.

### 2. Daily Log Edit Audit Trigger Overwrite
- **Issue:** When updating existing daily logs, the update trigger was overwriting the `created_at` timestamp of the original log.
- **Resolution:** Added `updated_at` column; ensured triggers only modify `updated_at` and insert delta changes into `daily_log_edits`.

### 3. PWA Service Worker Caching Supabase Auth Tokens
- **Issue:** Service worker cached 401 unauthorized responses when farm staff lost connectivity, locking them out even after reconnecting.
- **Resolution:** Explicitly excluded all `/auth/v1/*` and `/rest/v1/*` network paths from the Service Worker cache-first strategy. Always use `NetworkOnly` or custom sync queue for API routes.
```

---

## 3. Mandatory AI Workflows

### When starting a new session:
1. Read `PROJECT_PROGRESS.md` and `poultry_farm_system_spec.md` first.
2. Inspect the latest entries under **"Known Gotchas & Resolved Bugs"**.
3. Confirm what task is listed under **"In Progress / Next Up"**.

### When encountering an error:
1. Diagnose and fix the root cause.
2. Immediately log the bug under **"Known Gotchas & Resolved Bugs"** in `PROJECT_PROGRESS.md` explaining:
   * What caused the issue.
   * What failed.
   * How it was resolved.

### Simplicity Guardrails:
* **No over-engineering:** Do not add IoT sensors, automated ventilation, or complicated microservices unless explicitly requested.
* **Keep inputs minimal:** Mobile inputs must default to large numeric touch targets (`<input type="number" pattern="[0-9]*" inputmode="numeric" />`).
* **Preserve Audit Trail Integrity:** Never provide an `UPDATE` route for `daily_logs` that bypasses logging to `daily_log_edits`.