# Poultry Farm Operations Management System
## Product Requirements & Technical Specification Document

---

## 1. Executive Summary & Core Objectives
The objective is to replace manual paper and notepad logging across multiple poultry farms with a streamlined, mobile-friendly Progressive Web App (PWA). 

### Primary Directives:
* **Frictionless Daily Logging:** Simple, large-touch interfaces for farm supervisors and workers.
* **Offline-First Resilience:** Sheds have poor cellular connectivity. Data entry must work without active internet and sync automatically when connectivity resumes.
* **Strict Auditability:** Any modification to daily numbers (mortality, feed, water) must retain an immutable history showing who changed it, the previous value, the new value, timestamp, and the required reason.
* **Multi-Farm Visibility with Owner Control:** Owners can switch between farms, inspect batch economics, review miscellaneous expenses, and detect operational anomalies.
* **Lean Scope:** Exclude unnecessary climate/ventilation automation details; treat breed classification as optional.

---

## 2. User Roles & Access Hierarchy

| Role | Access Level & Permissions | Typical Device |
| :--- | :--- | :--- |
| **Owner (Admin)** | Full read/write across all farms. Add/archive farms and sheds. View financial breakdowns, bird sales, and cost-per-kg margins. Full access to the audit trail log. System settings and user management. | Desktop / Tablet / Mobile |
| **Supervisor** | Assigned to one or more specific farms. Can create new batches, log daily metrics, edit daily metrics (within an audit trail requirement), log farm/batch expenses, and view flock operational summaries. Cannot view owner net profits or delete farms. | Mobile / Tablet |
| **Worker** | Assigned to specific sheds. Restricted to entering daily shed operations (mortality, feed, water, notes). Can view the previous 48 hours of shed logs. Cannot see financials or modify historical data older than 24 hours without supervisor approval. | Mobile (PWA) |

---

## 3. Data Architecture (PostgreSQL Schema)

The database schema is structured for PostgreSQL (e.g., hosted on Supabase or Neon). It includes foreign key constraints, default timestamps, and dedicated audit tracking.

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & ROLES
CREATE TYPE user_role AS ENUM ('OWNER', 'SUPERVISOR', 'WORKER');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'WORKER',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. FARMS & SHEDS
CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    archived BOOLEAN DEFAULT FALSE
);

CREATE TABLE user_farm_assignments (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, farm_id)
);

CREATE TABLE sheds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- e.g., "Shed 1", "Tunnel Shed A"
    capacity INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. FLOCKS / BATCHES
CREATE TYPE flock_status AS ENUM ('ACTIVE', 'HARVESTED', 'CLOSED');

CREATE TABLE flocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shed_id UUID REFERENCES sheds(id) ON DELETE RESTRICT,
    flock_number VARCHAR(50) NOT NULL, -- e.g., "FLOCK-2026-01"
    placement_date DATE NOT NULL,
    initial_birds INT NOT NULL,
    breed VARCHAR(50) NULL, -- Optional (e.g., Cobb 500, Ross 308)
    cost_per_chick NUMERIC(10,2) DEFAULT 0,
    status flock_status DEFAULT 'ACTIVE',
    harvest_date DATE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. DAILY OPERATIONS LOGS
CREATE TABLE daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flock_id UUID REFERENCES flocks(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    mortality INT NOT NULL DEFAULT 0,
    culls INT NOT NULL DEFAULT 0,
    feed_consumed_kg NUMERIC(8,2) NOT NULL DEFAULT 0,
    water_liters NUMERIC(8,2) NOT NULL DEFAULT 0,
    sample_weight_grams NUMERIC(6,2) NULL,
    notes TEXT NULL,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(flock_id, log_date)
);

-- 5. IMMUTABLE AUDIT TRAIL FOR DAILY LOG EDITS
CREATE TABLE daily_log_edits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_log_id UUID REFERENCES daily_logs(id) ON DELETE CASCADE,
    flock_id UUID REFERENCES flocks(id) ON DELETE CASCADE,
    edited_by UUID REFERENCES users(id),
    field_name VARCHAR(50) NOT NULL,    -- 'mortality', 'feed_consumed_kg', etc.
    old_value TEXT NOT NULL,
    new_value TEXT NOT NULL,
    reason TEXT NOT NULL,                -- Mandatory justification
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. EXPENSES & FINANCIALS
CREATE TYPE expense_category AS ENUM (
    'CHICK_PURCHASE',
    'FEED_DELIVERY',
    'MEDICINE_VACCINE',
    'UTILITIES',
    'LABOR',
    'MAINTENANCE',
    'MISCELLANEOUS'
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    flock_id UUID REFERENCES flocks(id) ON DELETE SET NULL, -- NULL if general farm overhead
    category expense_category NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    description TEXT NOT NULL,
    expense_date DATE NOT NULL,
    receipt_url TEXT NULL,
    logged_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. BIRD SALES / HARVEST LOGS
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flock_id UUID REFERENCES flocks(id) ON DELETE CASCADE,
    sale_date DATE NOT NULL,
    buyer_name VARCHAR(100) NOT NULL,
    birds_sold INT NOT NULL,
    total_weight_kg NUMERIC(10,2) NOT NULL,
    price_per_kg NUMERIC(8,2) NOT NULL,
    total_amount NUMERIC(12,2) GENERATED ALWAYS AS (total_weight_kg * price_per_kg) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 4. Key Calculation Formulas & Business Logic

The system will compute these production indicators dynamically:

1. **Current Live Bird Population:**
   $$\text{Current Birds} = \text{Initial Birds} - \sum (\text{Daily Mortality} + \text{Daily Culls}) - \sum \text{Birds Sold}$$
2. **Cumulative Mortality Rate (%):**
   $$\text{Mortality \%} = \left( \frac{\sum \text{Mortality} + \sum \text{Culls}}{\text{Initial Birds}} \right) \times 100$$
3. **Feed Conversion Ratio (FCR) (at Harvest):**
   $$\text{FCR} = \frac{\text{Total Feed Consumed (kg)}}{\text{Total Live Weight Sold (kg)}}$$
4. **Flock Direct Profit/Loss:**
   $$\text{Net Profit} = \sum \text{Sales Revenue} - \left( \sum \text{Flock Expenses} + \text{Allocated Misc Expenses} \right)$$

---

## 5. Offline-First Synchronization Strategy

### Architecture:
* **Client-Side Storage:** Browser-native **IndexedDB** managed through `Dexie.js`.
* **Sync Pipeline:**
  1. User submits the daily log form on mobile.
  2. The record is written to the local IndexedDB table `sync_queue` with status `'PENDING'`.
  3. The UI immediately reflects the saved state with an amber icon ("Pending Sync").
  4. A background sync service listens for the browser's `navigator.onLine` and `window.addEventListener('online')` events.
  5. When online, the client pushes the queued records sequentially via batch REST/RPC endpoints.
  6. Upon server acknowledgment (`200 OK`), the local record status transitions to `'SYNCED'` (green checkmark).

### Conflict & Edit Protocol:
* Unique constraint: `(flock_id, log_date)`.
* If a record already exists on the server for that date and is being submitted as an update:
  * The server requires `reason` and `edited_by`.
  * The server writes the existing values to `daily_log_edits` and applies the update in an isolated transaction.