# Project Status & AI Memory Log

## Current Tech Stack
- **Frontend:** Next.js (App Router) + Tailwind CSS (Mobile-first responsive design)
- **Offline / PWA:** Dexie.js (IndexedDB wrapper) for client caching & queueing
- **Backend & Database:** Supabase (PostgreSQL with RLS)
- **Form Handling:** React Hook Form + Zod (Strict validation for shed numbers)

## Status Breakdown
- [ ] Database Schema setup in Supabase
- [ ] Multi-Farm & Shed setup UI (Owner view)
- [ ] Flock / Batch Creation & Assignment
- [ ] Mobile Daily Operations Log (Mortality, Feed, Water, Weight, Notes)
- [ ] Dexie.js Offline Sync Engine with Amber/Green status badge
- [ ] Daily Log Audit Modal (Tracks Old vs New value + Mandatory Reason)
- [ ] Expense & Financials Logging Screen (Direct Flock vs Farm Overhead)
- [ ] Owner Consolidation Dashboard & Batch Metrics (FCR, Mortality %)

## In Progress / Next Up
- [ ] Initialize project structure and run base database migrations.

## Known Gotchas & Resolved Bugs (DO NOT REPEAT)
*(AI agents: Document all edge-case bugs and resolutions here as they occur)*
- **Rule 1: Offline Sync Integrity:** Daily logs must be uniquely identified by `flock_id` + `log_date`. Do not generate random UUIDs on the client for daily records that can cause duplicate rows for the same day when synced twice.
- **Rule 2: Audit Logs are Immutable:** `daily_log_edits` table must NEVER have an `UPDATE` or `DELETE` policy. Only `INSERT` and `SELECT` are permitted.