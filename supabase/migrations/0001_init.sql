-- FlockOps: core schema, RLS, and audit integrity
-- PostgreSQL / Supabase

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('OWNER', 'SUPERVISOR', 'WORKER');
CREATE TYPE flock_status AS ENUM ('ACTIVE', 'HARVESTED', 'CLOSED');
CREATE TYPE expense_category AS ENUM (
  'CHICK_PURCHASE',
  'FEED_DELIVERY',
  'MEDICINE_VACCINE',
  'UTILITIES',
  'LABOR',
  'MAINTENANCE',
  'MISCELLANEOUS'
);
CREATE TYPE membership_status AS ENUM ('ACTIVE', 'INVITED', 'DISABLED');

-- ---------------------------------------------------------------------------
-- Tenancy
-- ---------------------------------------------------------------------------
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(80) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) UNIQUE,
  role user_role NOT NULL DEFAULT 'WORKER',
  status membership_status NOT NULL DEFAULT 'ACTIVE',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX users_organization_id_idx ON users (organization_id);

-- ---------------------------------------------------------------------------
-- Farms & sheds
-- ---------------------------------------------------------------------------
CREATE TABLE farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX farms_organization_id_idx ON farms (organization_id);

CREATE TABLE user_farm_assignments (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, farm_id)
);

CREATE TABLE sheds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  capacity INT NOT NULL CHECK (capacity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (farm_id, name)
);

CREATE INDEX sheds_farm_id_idx ON sheds (farm_id);

CREATE TABLE user_shed_assignments (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shed_id UUID NOT NULL REFERENCES sheds(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, shed_id)
);

-- ---------------------------------------------------------------------------
-- Flocks
-- ---------------------------------------------------------------------------
CREATE TABLE flocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shed_id UUID NOT NULL REFERENCES sheds(id) ON DELETE RESTRICT,
  flock_number VARCHAR(50) NOT NULL,
  placement_date DATE NOT NULL,
  initial_birds INT NOT NULL CHECK (initial_birds > 0),
  breed VARCHAR(50),
  cost_per_chick NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status flock_status NOT NULL DEFAULT 'ACTIVE',
  harvest_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (shed_id, flock_number)
);

CREATE INDEX flocks_shed_id_idx ON flocks (shed_id);
CREATE INDEX flocks_status_idx ON flocks (status);

-- ---------------------------------------------------------------------------
-- Daily operations
-- ---------------------------------------------------------------------------
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flock_id UUID NOT NULL REFERENCES flocks(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  mortality INT NOT NULL DEFAULT 0 CHECK (mortality >= 0),
  culls INT NOT NULL DEFAULT 0 CHECK (culls >= 0),
  feed_consumed_kg NUMERIC(8, 2) NOT NULL DEFAULT 0 CHECK (feed_consumed_kg >= 0),
  water_liters NUMERIC(8, 2) NOT NULL DEFAULT 0 CHECK (water_liters >= 0),
  sample_weight_grams NUMERIC(8, 2) CHECK (sample_weight_grams IS NULL OR sample_weight_grams >= 0),
  notes TEXT,
  recorded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (flock_id, log_date)
);

CREATE INDEX daily_logs_flock_date_idx ON daily_logs (flock_id, log_date DESC);

CREATE TABLE daily_log_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_log_id UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
  flock_id UUID NOT NULL REFERENCES flocks(id) ON DELETE CASCADE,
  edited_by UUID REFERENCES users(id),
  field_name VARCHAR(50) NOT NULL,
  old_value TEXT NOT NULL,
  new_value TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX daily_log_edits_log_id_idx ON daily_log_edits (daily_log_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Financials
-- ---------------------------------------------------------------------------
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  flock_id UUID REFERENCES flocks(id) ON DELETE SET NULL,
  category expense_category NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  description TEXT NOT NULL,
  expense_date DATE NOT NULL,
  receipt_url TEXT,
  logged_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX expenses_farm_date_idx ON expenses (farm_id, expense_date DESC);
CREATE INDEX expenses_flock_id_idx ON expenses (flock_id);

CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flock_id UUID NOT NULL REFERENCES flocks(id) ON DELETE CASCADE,
  sale_date DATE NOT NULL,
  buyer_name VARCHAR(100) NOT NULL,
  birds_sold INT NOT NULL CHECK (birds_sold > 0),
  total_weight_kg NUMERIC(10, 2) NOT NULL CHECK (total_weight_kg > 0),
  price_per_kg NUMERIC(8, 2) NOT NULL CHECK (price_per_kg >= 0),
  total_amount NUMERIC(12, 2) GENERATED ALWAYS AS (total_weight_kg * price_per_kg) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX sales_flock_id_idx ON sales (flock_id, sale_date DESC);

-- ---------------------------------------------------------------------------
-- updated_at: never mutate created_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.created_at = OLD.created_at;
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER farms_set_updated_at
  BEFORE UPDATE ON farms
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER sheds_set_updated_at
  BEFORE UPDATE ON sheds
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER flocks_set_updated_at
  BEFORE UPDATE ON flocks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER daily_logs_set_updated_at
  BEFORE UPDATE ON daily_logs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Daily log audit: write field-level history on UPDATE
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION record_daily_log_edits()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  reason_text TEXT;
BEGIN
  reason_text := NULLIF(current_setting('flockops.edit_reason', true), '');

  IF reason_text IS NULL THEN
    RAISE EXCEPTION 'A reason is required to update a daily log';
  END IF;

  IF OLD.mortality IS DISTINCT FROM NEW.mortality THEN
    INSERT INTO daily_log_edits (daily_log_id, flock_id, edited_by, field_name, old_value, new_value, reason)
    VALUES (NEW.id, NEW.flock_id, COALESCE(auth.uid(), NEW.recorded_by), 'mortality', OLD.mortality::TEXT, NEW.mortality::TEXT, reason_text);
  END IF;

  IF OLD.culls IS DISTINCT FROM NEW.culls THEN
    INSERT INTO daily_log_edits (daily_log_id, flock_id, edited_by, field_name, old_value, new_value, reason)
    VALUES (NEW.id, NEW.flock_id, COALESCE(auth.uid(), NEW.recorded_by), 'culls', OLD.culls::TEXT, NEW.culls::TEXT, reason_text);
  END IF;

  IF OLD.feed_consumed_kg IS DISTINCT FROM NEW.feed_consumed_kg THEN
    INSERT INTO daily_log_edits (daily_log_id, flock_id, edited_by, field_name, old_value, new_value, reason)
    VALUES (NEW.id, NEW.flock_id, COALESCE(auth.uid(), NEW.recorded_by), 'feed_consumed_kg', OLD.feed_consumed_kg::TEXT, NEW.feed_consumed_kg::TEXT, reason_text);
  END IF;

  IF OLD.water_liters IS DISTINCT FROM NEW.water_liters THEN
    INSERT INTO daily_log_edits (daily_log_id, flock_id, edited_by, field_name, old_value, new_value, reason)
    VALUES (NEW.id, NEW.flock_id, COALESCE(auth.uid(), NEW.recorded_by), 'water_liters', OLD.water_liters::TEXT, NEW.water_liters::TEXT, reason_text);
  END IF;

  IF OLD.sample_weight_grams IS DISTINCT FROM NEW.sample_weight_grams THEN
    INSERT INTO daily_log_edits (daily_log_id, flock_id, edited_by, field_name, old_value, new_value, reason)
    VALUES (NEW.id, NEW.flock_id, COALESCE(auth.uid(), NEW.recorded_by), 'sample_weight_grams', COALESCE(OLD.sample_weight_grams::TEXT, ''), COALESCE(NEW.sample_weight_grams::TEXT, ''), reason_text);
  END IF;

  IF OLD.notes IS DISTINCT FROM NEW.notes THEN
    INSERT INTO daily_log_edits (daily_log_id, flock_id, edited_by, field_name, old_value, new_value, reason)
    VALUES (NEW.id, NEW.flock_id, COALESCE(auth.uid(), NEW.recorded_by), 'notes', COALESCE(OLD.notes, ''), COALESCE(NEW.notes, ''), reason_text);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER daily_logs_record_edits
  BEFORE UPDATE ON daily_logs
  FOR EACH ROW EXECUTE FUNCTION record_daily_log_edits();

-- ---------------------------------------------------------------------------
-- Immutable audit rows
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION forbid_daily_log_edit_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'daily_log_edits is immutable';
END;
$$;

CREATE TRIGGER daily_log_edits_no_update
  BEFORE UPDATE ON daily_log_edits
  FOR EACH ROW EXECUTE FUNCTION forbid_daily_log_edit_mutation();

CREATE TRIGGER daily_log_edits_no_delete
  BEFORE DELETE ON daily_log_edits
  FOR EACH ROW EXECUTE FUNCTION forbid_daily_log_edit_mutation();

-- ---------------------------------------------------------------------------
-- Helpers for RLS
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION current_user_record()
RETURNS users
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM users WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION is_owner()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND role = 'OWNER'
      AND is_active = TRUE
      AND status = 'ACTIVE'
  )
$$;

CREATE OR REPLACE FUNCTION current_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM users WHERE id = auth.uid()
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_farm_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheds ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_shed_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE flocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_log_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Organizations
CREATE POLICY organizations_select ON organizations
  FOR SELECT USING (id = current_org_id());

CREATE POLICY organizations_update ON organizations
  FOR UPDATE USING (is_owner() AND id = current_org_id());

-- Users
CREATE POLICY users_select ON users
  FOR SELECT USING (organization_id = current_org_id());

CREATE POLICY users_insert ON users
  FOR INSERT WITH CHECK (is_owner() AND organization_id = current_org_id());

CREATE POLICY users_update ON users
  FOR UPDATE USING (is_owner() AND organization_id = current_org_id());

-- Farms
CREATE POLICY farms_select ON farms
  FOR SELECT USING (
    organization_id = current_org_id()
    AND (
      is_owner()
      OR EXISTS (
        SELECT 1 FROM user_farm_assignments a
        WHERE a.farm_id = farms.id AND a.user_id = auth.uid()
      )
    )
  );

CREATE POLICY farms_insert ON farms
  FOR INSERT WITH CHECK (is_owner() AND organization_id = current_org_id());

CREATE POLICY farms_update ON farms
  FOR UPDATE USING (is_owner() AND organization_id = current_org_id())
  WITH CHECK (is_owner() AND organization_id = current_org_id());

-- Farm assignments
CREATE POLICY user_farm_assignments_select ON user_farm_assignments
  FOR SELECT USING (
    user_id = auth.uid()
    OR is_owner()
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'SUPERVISOR' AND u.organization_id = current_org_id()
    )
  );

CREATE POLICY user_farm_assignments_write ON user_farm_assignments
  FOR ALL USING (is_owner())
  WITH CHECK (is_owner());

-- Sheds
CREATE POLICY sheds_select ON sheds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM farms f
      WHERE f.id = sheds.farm_id
        AND f.organization_id = current_org_id()
        AND (
          is_owner()
          OR EXISTS (
            SELECT 1 FROM user_farm_assignments a
            WHERE a.farm_id = f.id AND a.user_id = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM user_shed_assignments s
            WHERE s.shed_id = sheds.id AND s.user_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY sheds_insert ON sheds
  FOR INSERT WITH CHECK (is_owner());

CREATE POLICY sheds_update ON sheds
  FOR UPDATE USING (is_owner())
  WITH CHECK (is_owner());

-- Shed assignments
CREATE POLICY user_shed_assignments_select ON user_shed_assignments
  FOR SELECT USING (user_id = auth.uid() OR is_owner());

CREATE POLICY user_shed_assignments_write ON user_shed_assignments
  FOR ALL USING (is_owner())
  WITH CHECK (is_owner());

-- Flocks
CREATE POLICY flocks_select ON flocks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sheds s
      JOIN farms f ON f.id = s.farm_id
      WHERE s.id = flocks.shed_id
        AND f.organization_id = current_org_id()
        AND (
          is_owner()
          OR EXISTS (
            SELECT 1 FROM user_farm_assignments a
            WHERE a.farm_id = f.id AND a.user_id = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM user_shed_assignments sa
            WHERE sa.shed_id = s.id AND sa.user_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY flocks_supervisor_write ON flocks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      JOIN sheds s ON s.id = flocks.shed_id
      JOIN farms f ON f.id = s.farm_id
      WHERE u.id = auth.uid()
        AND u.is_active
        AND f.organization_id = u.organization_id
        AND (
          u.role = 'OWNER'
          OR (
            u.role = 'SUPERVISOR'
            AND EXISTS (
              SELECT 1 FROM user_farm_assignments a
              WHERE a.farm_id = f.id AND a.user_id = u.id
            )
          )
        )
    )
  );

CREATE POLICY flocks_supervisor_update ON flocks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN sheds s ON s.id = flocks.shed_id
      JOIN farms f ON f.id = s.farm_id
      WHERE u.id = auth.uid()
        AND u.is_active
        AND f.organization_id = u.organization_id
        AND (
          u.role = 'OWNER'
          OR (
            u.role = 'SUPERVISOR'
            AND EXISTS (
              SELECT 1 FROM user_farm_assignments a
              WHERE a.farm_id = f.id AND a.user_id = u.id
            )
          )
        )
    )
  );

-- Daily logs
CREATE POLICY daily_logs_select ON daily_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM flocks fl
      JOIN sheds s ON s.id = fl.shed_id
      JOIN farms f ON f.id = s.farm_id
      WHERE fl.id = daily_logs.flock_id
        AND f.organization_id = current_org_id()
        AND (
          is_owner()
          OR EXISTS (
            SELECT 1 FROM user_farm_assignments a
            WHERE a.farm_id = f.id AND a.user_id = auth.uid()
          )
          OR (
            EXISTS (
              SELECT 1 FROM user_shed_assignments sa
              WHERE sa.shed_id = s.id AND sa.user_id = auth.uid()
            )
            AND daily_logs.log_date >= (CURRENT_DATE - INTERVAL '2 days')
          )
        )
    )
  );

CREATE POLICY daily_logs_insert ON daily_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM flocks fl
      JOIN sheds s ON s.id = fl.shed_id
      JOIN farms f ON f.id = s.farm_id
      JOIN users u ON u.id = auth.uid()
      WHERE fl.id = daily_logs.flock_id
        AND f.organization_id = u.organization_id
        AND u.is_active
        AND (
          u.role = 'OWNER'
          OR EXISTS (
            SELECT 1 FROM user_farm_assignments a
            WHERE a.farm_id = f.id AND a.user_id = u.id
          )
          OR EXISTS (
            SELECT 1 FROM user_shed_assignments sa
            WHERE sa.shed_id = s.id AND sa.user_id = u.id
          )
        )
    )
  );

CREATE POLICY daily_logs_update ON daily_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN flocks fl ON fl.id = daily_logs.flock_id
      JOIN sheds s ON s.id = fl.shed_id
      JOIN farms f ON f.id = s.farm_id
      WHERE u.id = auth.uid()
        AND u.is_active
        AND f.organization_id = u.organization_id
        AND (
          u.role = 'OWNER'
          OR (
            u.role = 'SUPERVISOR'
            AND EXISTS (
              SELECT 1 FROM user_farm_assignments a
              WHERE a.farm_id = f.id AND a.user_id = u.id
            )
          )
          OR (
            u.role = 'WORKER'
            AND EXISTS (
              SELECT 1 FROM user_shed_assignments sa
              WHERE sa.shed_id = s.id AND sa.user_id = u.id
            )
            AND daily_logs.log_date >= (CURRENT_DATE - INTERVAL '1 day')
          )
        )
    )
  );

CREATE POLICY daily_log_edits_select ON daily_log_edits
  FOR SELECT USING (
    is_owner()
    OR EXISTS (
      SELECT 1 FROM flocks fl
      JOIN sheds s ON s.id = fl.shed_id
      JOIN farms f ON f.id = s.farm_id
      JOIN user_farm_assignments a ON a.farm_id = f.id AND a.user_id = auth.uid()
      WHERE fl.id = daily_log_edits.flock_id
    )
  );

CREATE POLICY daily_log_edits_insert ON daily_log_edits
  FOR INSERT WITH CHECK (true);

-- Expenses: supervisors and owners; workers never see financials
CREATE POLICY expenses_select ON expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM farms f
      JOIN users u ON u.id = auth.uid()
      WHERE f.id = expenses.farm_id
        AND f.organization_id = u.organization_id
        AND u.role IN ('OWNER', 'SUPERVISOR')
        AND (
          u.role = 'OWNER'
          OR EXISTS (
            SELECT 1 FROM user_farm_assignments a
            WHERE a.farm_id = f.id AND a.user_id = u.id
          )
        )
    )
  );

CREATE POLICY expenses_insert ON expenses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM farms f
      JOIN users u ON u.id = auth.uid()
      WHERE f.id = expenses.farm_id
        AND f.organization_id = u.organization_id
        AND u.role IN ('OWNER', 'SUPERVISOR')
        AND (
          u.role = 'OWNER'
          OR EXISTS (
            SELECT 1 FROM user_farm_assignments a
            WHERE a.farm_id = f.id AND a.user_id = u.id
          )
        )
    )
  );

-- Sales / net profit: owner only
CREATE POLICY sales_select ON sales
  FOR SELECT USING (is_owner());

CREATE POLICY sales_write ON sales
  FOR ALL USING (is_owner())
  WITH CHECK (is_owner());

REVOKE UPDATE, DELETE ON daily_log_edits FROM PUBLIC;
REVOKE UPDATE, DELETE ON daily_log_edits FROM anon, authenticated;

-- ---------------------------------------------------------------------------
-- Auth signup: first user becomes Owner of a new organization
-- Invited staff pass organization_id (+ role) in user metadata
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_id UUID;
  org_name TEXT;
  org_slug TEXT;
  member_role user_role;
BEGIN
  IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;

  member_role := CASE
    WHEN NEW.raw_user_meta_data->>'role' IN ('OWNER', 'SUPERVISOR', 'WORKER')
      THEN (NEW.raw_user_meta_data->>'role')::user_role
    ELSE 'OWNER'::user_role
  END;

  IF NULLIF(NEW.raw_user_meta_data->>'organization_id', '') IS NOT NULL THEN
    INSERT INTO public.users (
      id, organization_id, full_name, phone_number, role, status
    ) VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'organization_id')::uuid,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Team member'),
      NULLIF(NEW.raw_user_meta_data->>'phone_number', ''),
      member_role,
      'ACTIVE'
    );
    RETURN NEW;
  END IF;

  org_name := COALESCE(NULLIF(NEW.raw_user_meta_data->>'organization_name', ''), 'My company');
  org_slug := lower(regexp_replace(org_name, '[^a-zA-Z0-9]+', '-', 'g'));
  org_slug := trim(both '-' from org_slug);
  IF org_slug = '' THEN
    org_slug := 'org';
  END IF;
  org_slug := org_slug || '-' || substr(NEW.id::text, 1, 8);

  INSERT INTO public.organizations (name, slug)
  VALUES (org_name, org_slug)
  RETURNING id INTO org_id;

  INSERT INTO public.users (
    id, organization_id, full_name, phone_number, role, status
  ) VALUES (
    NEW.id,
    org_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Owner'),
    NULLIF(NEW.raw_user_meta_data->>'phone_number', ''),
    'OWNER',
    'ACTIVE'
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
