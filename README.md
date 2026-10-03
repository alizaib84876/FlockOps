# FlockOps

Poultry operations for commercial farms. Daily shed logging on the phone, offline when the signal drops, an audit trail when numbers change, and owner-level flock economics.

Install it on a home screen like an app. Workers log in the shed. Owners see farms, costs, and sales.

## What it does

- **Daily logs** — mortality, sick/culled (optional), feed, water, sample weight, and notes. One record per flock per day.
- **Offline** — if the network is down, the log stays on the device and uploads when you are back online.
- **Audit trail** — every change stores who edited it, the old value, the new value, the time, and a required reason.
- **Farms and flocks** — multiple farms, sheds with capacity, one active flock per shed. Harvest or close a batch when it ends.
- **Finance** — expenses on a flock or farm overhead. Sales use weighbridge empty vs loaded weight, not bird counts.
- **Team** — owners invite supervisors (by farm) and workers (by shed).

## Roles

| Role | Access |
| :--- | :--- |
| **Owner** | All farms, sales, margins, team, and the full audit trail. |
| **Supervisor** | Assigned farms: flocks, daily logs, expenses, operational summaries. No owner net profit. |
| **Worker** | Assigned sheds only. Today and yesterday for writing logs. Last 48 hours of history. No financials. |

## How to use

### Get in

Create a workspace as the owner, or sign in if you already have one. Use **Forgot password** if you cannot get in. After you are signed in, **Account** is where you change your name, phone, or password.

### Set up the farm

1. **Farms** — add a farm, then add sheds with capacity.
2. **Flocks** — place a batch in an empty shed (placement date, initial birds, optional breed). Only one active flock per shed.
3. **Logs** — open a flock and enter today’s numbers. Sick/culled can be left blank.
4. **Expenses** — charge costs to an active flock or to farm overhead.
5. **Sales** — record empty and loaded vehicle weights. Net kg is loaded minus empty.
6. **Team** — invite supervisors (pick farms) and workers (pick sheds). They must sign up with the invited email.

Harvest or close a flock when the batch is done. Harvested flocks leave live-bird counts and leave expense/sale pickers.

### Daily logs

- One log per flock per calendar day.
- Changing an existing log requires a reason. Previous values stay in history with the editor’s name.
- Workers can only write today and yesterday.
- Offline logs show as pending until they sync.
