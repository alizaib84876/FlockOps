# Project Status & AI Memory Log

## Current Tech Stack
- Frontend: Next.js 16 (App Router) / React 19 / Tailwind CSS 4
- PWA / Offline: Dexie.js queue (service worker not installed yet; do not cache /auth/v1 or /rest/v1)
- Backend / Database: Supabase / PostgreSQL (project connected; schema applied by owner)
- Auth: @supabase/ssr + @supabase/supabase-js
- State Management: TanStack React Query (planned)

## Implemented & Verified Features
- [x] Next.js project scaffold with professional FlockOps marketing shell
- [x] Database migration authored for organizations, users, farms, sheds, assignments, flocks, daily logs, audit trail, expenses, and sales, including RLS, immutable audit rules, and owner signup trigger
- [x] Product renamed to FlockOps
- [x] Supabase URL + publishable key stored in `.env.local`
- [x] Sign in / create workspace screens and protected `/app` shell
- [x] Owner login confirmed by user
- [x] Owner farm & shed setup UI (create, edit, archive farm; add/edit sheds with capacity)
- [x] Flock / batch placement into a shed (one active flock per shed; harvest/close)
- [x] Mobile daily operations log (mortality, optional sick/culled, feed, water, weight, notes; unique flock + date)
- [x] Dexie.js offline sync queue for daily logs (identity = flock_id + log_date; amber pending / green synced)
- [x] Expense logging (flock vs farm overhead) and owner-only sales
- [x] Role-specific overview: owner farm/shed dashboard, supervisor operations (no owner profit), worker assigned sheds
- [x] Owner team invites for supervisors (farms) and workers (sheds)
- [x] Installable PWA (manifest + home-screen icons; Dexie remains the offline path — do not cache Supabase)
- [x] Password reset, account profile, privacy/terms, and 404

## In Progress / Next Up
- [ ] Optional Serwist/full service-worker HTML cache (only if installable PWA is not enough)

## Known Gotchas & Resolved Bugs (DO NOT REPEAT)
- **Rule 1: Offline Sync Integrity:** Daily logs must be uniquely identified by `flock_id` + `log_date`. Do not generate random UUIDs on the client for daily records that can cause duplicate rows for the same day when synced twice.
- **Rule 2: Audit Logs are Immutable:** `daily_log_edits` table must NEVER have an `UPDATE` or `DELETE` policy. Only `INSERT` and `SELECT` are permitted. Database triggers reject UPDATE/DELETE.
- **Rule 3: Daily log updates require a reason:** Application and SQL must set `flockops.edit_reason` (via `set_config`) before updating `daily_logs`. There is no bypass UPDATE path.
- **IndexedDB Date Deserialization in Safari:** Always serialize dates to `YYYY-MM-DD` strings before persisting to Dexie. Never store raw `Date()` objects in the local offline table.
- **PWA Service Worker Caching:** Explicitly exclude `/auth/v1/*` and `/rest/v1/*` from cache-first. Use NetworkOnly or the sync queue for API routes.
- **create-next-app:** Directory was not empty (spec markdown files). Scaffolded in a temp folder and merged. Do not re-run create-next-app in the repo root.
- **updated_at vs created_at:** `set_updated_at()` copies `OLD.created_at` onto `NEW.created_at` so updates cannot rewrite original log time.
- **Supabase keys:** This project uses the new `sb_publishable_…` key. Read `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` with fallback to `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Schema not auto-applied:** The publishable key can query REST but cannot run DDL. Migration must be executed in the Supabase SQL editor (or with the database password / service role).
- **Farms are archived, not deleted.** Sheds are edited in place; no delete, because flocks will restrict shed removal.
- **One active flock per shed:** Enforced in `createFlock` before insert. Shed assignment cannot change after placement.
- **Daily log timezone:** Use local calendar dates (`todayIsoDate`), never `toISOString().slice(0, 10)`, which is UTC and drifts in PKT.
- **Daily log edits:** Must go through `save_daily_log` RPC so `flockops.edit_reason` is set in the same transaction. Direct table UPDATE is not used.
- **Sales are weighbridge-based:** Net kg = loaded vehicle − empty vehicle. Do not collect bird headcount. Record sales only against ACTIVE flocks.
- **Finance corrections:** Expenses and sales are updated through `update_expense` / `update_sale` RPCs. Audit tables are insert-only. Never bypass with a raw UPDATE.
- **Invites:** Trust `invite_token` in `handle_new_user`, not client-supplied `organization_id`/`role`. Invite email must match the signup email.
- **Live birds:** Only ACTIVE flocks. Harvested/closed batches are 0 live. Sales are weighbridge kg, not headcount, so harvest status is what zeroes the live count.
- **Sync badge hydration:** Never seed `online` from `navigator.onLine` during render. SSR and the browser disagree; set it in `useEffect` after mount.
- **Worker log edits:** Workers may write today and yesterday only (matches `daily_logs` UPDATE RLS). Do not use `toISOString()` when computing that window.
- **Password reset:** `resetPasswordForEmail` must redirect to `/auth/confirm?next=/update-password`. Add that URL under Authentication → URL configuration in Supabase. Never cache `/auth/v1`.
