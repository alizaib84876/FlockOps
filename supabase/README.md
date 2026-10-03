# Database

Apply in order:

1. `migrations/0001_init.sql`
2. `migrations/0002_save_daily_log.sql` (required to edit an existing daily log)
3. `migrations/0003_sales_weighbridge.sql`
4. `migrations/0004_finance_edits.sql` (expense and sale corrections with immutable audit logs)
5. `migrations/0005_team_invites.sql` (supervisor/worker invites and assignment on signup)
6. `migrations/0006_worker_farm_select.sql` (workers can read the parent farm of assigned sheds)
8. `migrations/0008_update_own_profile.sql` (account page can save name and phone)

Auth redirect URLs in the Supabase dashboard must include:

- `http://localhost:3000/auth/confirm`
- your production origin + `/auth/confirm`

The first migration creates:

- Organization tenancy
- Users linked to `auth.users`
- Farms, sheds, assignments, flocks
- Daily logs with `(flock_id, log_date)` uniqueness
- Immutable `daily_log_edits`
- Expenses and sales
- `updated_at` triggers that never rewrite `created_at`
- Row Level Security aligned to Owner / Supervisor / Worker
- Auth trigger that provisions an Owner workspace on signup

Updates to `daily_logs` require:

```sql
SELECT set_config('flockops.edit_reason', 'Corrected feed scale reading', true);
```
