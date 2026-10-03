# FlockOps

Poultry operations platform for commercial farms. Replace notepad logging with mobile daily entry, offline sync, an immutable audit trail, and owner-level flock economics.

FlockOps is a Progressive Web App: install it on a phone home screen, log in sheds with poor signal, and sync when the network returns.

## What it does

- **Daily logs** — mortality, sick/culled (optional), feed, water, sample weight, and notes. One record per flock per calendar day.
- **Offline queue** — entries save on the device and upload when online. Each day is identified by flock + date so the same log is never duplicated.
- **Audit trail** — edits keep who changed the number, the old value, the new value, the time, and a required reason. History is insert-only.
- **Farms and flocks** — multiple farms, sheds with capacity, one active flock per shed, harvest or close when the batch ends.
- **Finance** — expenses charged to a flock or to farm overhead. Sales are weighbridge based (empty vs loaded vehicle weight), not bird counts.
- **Team** — owners invite supervisors (by farm) and workers (by shed).

## Roles

| Role | Access |
| :--- | :--- |
| **Owner** | All farms, sales, margins, team, and the full audit trail. |
| **Supervisor** | Assigned farms: flocks, daily logs, expenses, operational summaries. No owner net profit. |
| **Worker** | Assigned sheds only. Today and yesterday for writing logs. Last 48 hours of history. No financials. |

## Stack

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- Supabase (PostgreSQL, Auth, Row Level Security)
- Dexie.js for the on-device daily-log queue

## Prerequisites

- Node.js 20 or later
- A [Supabase](https://supabase.com) project
- npm

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/alizaib84876/FlockOps.git
cd FlockOps
npm install
cp .env.example .env.local
```

### 2. Environment variables

In `.env.local`, set:

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is optional (legacy alias). Do not put the service role key in the Next.js app. Never commit `.env.local`.

### 3. Database

In the Supabase SQL editor, run every file in `supabase/migrations/` **in order**:

1. `0001_init.sql` — organizations, users, farms, sheds, flocks, logs, expenses, sales, RLS
2. `0002_save_daily_log.sql` — daily log create/update with audit reason
3. `0003_sales_weighbridge.sql` — empty vs loaded vehicle weight
4. `0004_finance_edits.sql` — expense and sale corrections with audit logs
5. `0005_team_invites.sql` — supervisor and worker invites
6. `0006_worker_farm_select.sql` — workers can read the parent farm of assigned sheds
7. `0007_fix_farm_select_recursion.sql` — farm RLS helper (avoids policy recursion)
8. `0008_update_own_profile.sql` — account page can save name and phone

### 4. Auth URLs

In Supabase: **Authentication → URL configuration**.

- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/confirm`

This is required for signup confirmation and forgot password.

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production check
npm run lint
```

## How to use

### Create a workspace

1. Open **Create a workspace** and register as the owner (farm name, your name, email, password).
2. Confirm the email if Supabase asks you to.
3. Sign in. You land on the operations overview.

### Set up the farm

1. **Farms** — add a farm and location, then add sheds with capacity.
2. **Flocks** — place a batch in an empty shed (placement date, initial birds, optional breed). Only one active flock per shed.
3. **Logs** — open a flock and enter today’s numbers. Large inputs are meant for phones. Sick/culled can be left blank.
4. **Expenses** — charge feed, medicine, or other costs to an active flock or to farm overhead.
5. **Sales** — record weighbridge empty and loaded weights for an active flock. Net kg is loaded minus empty.
6. **Team** — invite supervisors (pick farms) and workers (pick sheds). They sign up with that invite email.
7. **Account** — update name, phone, or password. Use **Forgot password** on the sign-in screen if you are locked out.

Harvest or close a flock when the batch is done. Harvested flocks drop out of live-bird counts and out of expense/sale pickers.

### Daily log rules

- One log per flock per local calendar day.
- Changing an existing log requires a reason; the previous values stay in history with the editor’s name.
- Workers can only write today and yesterday.
- Offline: if the network is down, the log queues on the device (pending badge) and syncs when you are back online.

## Production deploy

Vercel (or any Node host that runs Next.js) works. Set the same `NEXT_PUBLIC_*` variables on the host, using your live URL for `NEXT_PUBLIC_APP_URL`.

In Supabase Auth URL configuration, add:

- Site URL: `https://your-domain`
- Redirect: `https://your-domain/auth/confirm`

Keep the localhost redirect if you still develop locally. Use HTTPS in production.

## Project layout

```
src/app/                 Marketing, auth, and /app workspace
src/lib/                 Auth, farms, flocks, logs, finance, team, offline
supabase/migrations/     PostgreSQL schema and RPCs (apply in order)
```

## License

Private project. All rights reserved unless a license is added later.
