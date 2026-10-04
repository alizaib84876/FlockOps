-- Assignment policies must not SELECT farms/sheds under RLS: farms_select already
-- reads user_farm_assignments, and that loop raises infinite recursion.

CREATE OR REPLACE FUNCTION public.farm_in_current_org(p_farm_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM farms
    WHERE id = p_farm_id
      AND organization_id = current_org_id()
  )
$$;

CREATE OR REPLACE FUNCTION public.shed_in_current_org(p_shed_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM sheds sh
    JOIN farms f ON f.id = sh.farm_id
    WHERE sh.id = p_shed_id
      AND f.organization_id = current_org_id()
  )
$$;

CREATE OR REPLACE FUNCTION public.flock_in_current_org(p_flock_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM flocks fl
    JOIN sheds sh ON sh.id = fl.shed_id
    JOIN farms f ON f.id = sh.farm_id
    WHERE fl.id = p_flock_id
      AND f.organization_id = current_org_id()
  )
$$;

CREATE OR REPLACE FUNCTION public.can_read_flock_audit(p_flock_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    flock_in_current_org(p_flock_id)
    AND (
      is_owner()
      OR EXISTS (
        SELECT 1
        FROM flocks fl
        JOIN sheds sh ON sh.id = fl.shed_id
        JOIN user_farm_assignments a
          ON a.farm_id = sh.farm_id AND a.user_id = auth.uid()
        WHERE fl.id = p_flock_id
      )
    )
$$;

GRANT EXECUTE ON FUNCTION public.farm_in_current_org(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.shed_in_current_org(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.flock_in_current_org(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_read_flock_audit(uuid) TO authenticated;

DROP POLICY IF EXISTS user_farm_assignments_select ON user_farm_assignments;
CREATE POLICY user_farm_assignments_select ON user_farm_assignments
  FOR SELECT USING (
    user_id = auth.uid()
    OR (
      farm_in_current_org(farm_id)
      AND (
        is_owner()
        OR EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = auth.uid()
            AND u.role = 'SUPERVISOR'
            AND u.organization_id = current_org_id()
        )
      )
    )
  );

DROP POLICY IF EXISTS user_farm_assignments_write ON user_farm_assignments;
CREATE POLICY user_farm_assignments_write ON user_farm_assignments
  FOR ALL USING (is_owner() AND farm_in_current_org(farm_id))
  WITH CHECK (is_owner() AND farm_in_current_org(farm_id));

DROP POLICY IF EXISTS user_shed_assignments_select ON user_shed_assignments;
CREATE POLICY user_shed_assignments_select ON user_shed_assignments
  FOR SELECT USING (
    user_id = auth.uid()
    OR (is_owner() AND shed_in_current_org(shed_id))
  );

DROP POLICY IF EXISTS user_shed_assignments_write ON user_shed_assignments;
CREATE POLICY user_shed_assignments_write ON user_shed_assignments
  FOR ALL USING (is_owner() AND shed_in_current_org(shed_id))
  WITH CHECK (is_owner() AND shed_in_current_org(shed_id));

DROP POLICY IF EXISTS sheds_insert ON sheds;
CREATE POLICY sheds_insert ON sheds
  FOR INSERT WITH CHECK (is_owner() AND farm_in_current_org(farm_id));

DROP POLICY IF EXISTS sheds_update ON sheds;
CREATE POLICY sheds_update ON sheds
  FOR UPDATE USING (is_owner() AND farm_in_current_org(farm_id))
  WITH CHECK (is_owner() AND farm_in_current_org(farm_id));

DROP POLICY IF EXISTS daily_log_edits_select ON daily_log_edits;
CREATE POLICY daily_log_edits_select ON daily_log_edits
  FOR SELECT USING (can_read_flock_audit(flock_id));

DROP POLICY IF EXISTS sales_select ON sales;
CREATE POLICY sales_select ON sales
  FOR SELECT USING (is_owner() AND flock_in_current_org(flock_id));

DROP POLICY IF EXISTS sales_write ON sales;
CREATE POLICY sales_write ON sales
  FOR ALL USING (is_owner() AND flock_in_current_org(flock_id))
  WITH CHECK (is_owner() AND flock_in_current_org(flock_id));

DROP POLICY IF EXISTS sale_edits_select ON sale_edits;
CREATE POLICY sale_edits_select ON sale_edits
  FOR SELECT USING (
    is_owner()
    AND EXISTS (
      SELECT 1 FROM sales sl
      WHERE sl.id = sale_edits.sale_id
        AND flock_in_current_org(sl.flock_id)
    )
  );
