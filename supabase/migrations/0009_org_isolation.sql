-- Workspace isolation: is_owner() means this user is an owner, not that they
-- may read every owner's rows. Scope remaining owner-only policies to current_org_id().

DROP POLICY IF EXISTS daily_log_edits_select ON daily_log_edits;
CREATE POLICY daily_log_edits_select ON daily_log_edits
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM flocks fl
      JOIN sheds s ON s.id = fl.shed_id
      JOIN farms f ON f.id = s.farm_id
      WHERE fl.id = daily_log_edits.flock_id
        AND f.organization_id = current_org_id()
        AND (
          is_owner()
          OR EXISTS (
            SELECT 1 FROM user_farm_assignments a
            WHERE a.farm_id = f.id AND a.user_id = auth.uid()
          )
        )
    )
  );

DROP POLICY IF EXISTS sales_select ON sales;
CREATE POLICY sales_select ON sales
  FOR SELECT USING (
    is_owner()
    AND EXISTS (
      SELECT 1
      FROM flocks fl
      JOIN sheds s ON s.id = fl.shed_id
      JOIN farms f ON f.id = s.farm_id
      WHERE fl.id = sales.flock_id
        AND f.organization_id = current_org_id()
    )
  );

DROP POLICY IF EXISTS sales_write ON sales;
CREATE POLICY sales_write ON sales
  FOR ALL USING (
    is_owner()
    AND EXISTS (
      SELECT 1
      FROM flocks fl
      JOIN sheds s ON s.id = fl.shed_id
      JOIN farms f ON f.id = s.farm_id
      WHERE fl.id = sales.flock_id
        AND f.organization_id = current_org_id()
    )
  )
  WITH CHECK (
    is_owner()
    AND EXISTS (
      SELECT 1
      FROM flocks fl
      JOIN sheds s ON s.id = fl.shed_id
      JOIN farms f ON f.id = s.farm_id
      WHERE fl.id = sales.flock_id
        AND f.organization_id = current_org_id()
    )
  );

DROP POLICY IF EXISTS sale_edits_select ON sale_edits;
CREATE POLICY sale_edits_select ON sale_edits
  FOR SELECT USING (
    is_owner()
    AND EXISTS (
      SELECT 1
      FROM sales sl
      JOIN flocks fl ON fl.id = sl.flock_id
      JOIN sheds s ON s.id = fl.shed_id
      JOIN farms f ON f.id = s.farm_id
      WHERE sl.id = sale_edits.sale_id
        AND f.organization_id = current_org_id()
    )
  );

DROP POLICY IF EXISTS user_farm_assignments_select ON user_farm_assignments;
CREATE POLICY user_farm_assignments_select ON user_farm_assignments
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM farms f
      WHERE f.id = user_farm_assignments.farm_id
        AND f.organization_id = current_org_id()
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
  FOR ALL USING (
    is_owner()
    AND EXISTS (
      SELECT 1 FROM farms f
      WHERE f.id = user_farm_assignments.farm_id
        AND f.organization_id = current_org_id()
    )
  )
  WITH CHECK (
    is_owner()
    AND EXISTS (
      SELECT 1 FROM farms f
      WHERE f.id = user_farm_assignments.farm_id
        AND f.organization_id = current_org_id()
    )
  );

DROP POLICY IF EXISTS user_shed_assignments_select ON user_shed_assignments;
CREATE POLICY user_shed_assignments_select ON user_shed_assignments
  FOR SELECT USING (
    user_id = auth.uid()
    OR (
      is_owner()
      AND EXISTS (
        SELECT 1
        FROM sheds sh
        JOIN farms f ON f.id = sh.farm_id
        WHERE sh.id = user_shed_assignments.shed_id
          AND f.organization_id = current_org_id()
      )
    )
  );

DROP POLICY IF EXISTS user_shed_assignments_write ON user_shed_assignments;
CREATE POLICY user_shed_assignments_write ON user_shed_assignments
  FOR ALL USING (
    is_owner()
    AND EXISTS (
      SELECT 1
      FROM sheds sh
      JOIN farms f ON f.id = sh.farm_id
      WHERE sh.id = user_shed_assignments.shed_id
        AND f.organization_id = current_org_id()
    )
  )
  WITH CHECK (
    is_owner()
    AND EXISTS (
      SELECT 1
      FROM sheds sh
      JOIN farms f ON f.id = sh.farm_id
      WHERE sh.id = user_shed_assignments.shed_id
        AND f.organization_id = current_org_id()
    )
  );

DROP POLICY IF EXISTS sheds_insert ON sheds;
CREATE POLICY sheds_insert ON sheds
  FOR INSERT WITH CHECK (
    is_owner()
    AND EXISTS (
      SELECT 1 FROM farms f
      WHERE f.id = sheds.farm_id
        AND f.organization_id = current_org_id()
    )
  );

DROP POLICY IF EXISTS sheds_update ON sheds;
CREATE POLICY sheds_update ON sheds
  FOR UPDATE USING (
    is_owner()
    AND EXISTS (
      SELECT 1 FROM farms f
      WHERE f.id = sheds.farm_id
        AND f.organization_id = current_org_id()
    )
  )
  WITH CHECK (
    is_owner()
    AND EXISTS (
      SELECT 1 FROM farms f
      WHERE f.id = sheds.farm_id
        AND f.organization_id = current_org_id()
    )
  );
