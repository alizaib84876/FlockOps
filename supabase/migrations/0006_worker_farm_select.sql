-- Workers are assigned to sheds, not farms. They still need to read the parent
-- farm row so flock lists can show farm names. Do not join sheds from farms RLS:
-- sheds_select already reads farms, and that loop raises "infinite recursion".

CREATE OR REPLACE FUNCTION public.worker_assigned_to_farm(p_farm_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_shed_assignments usa
    JOIN sheds sh ON sh.id = usa.shed_id
    WHERE usa.user_id = auth.uid()
      AND sh.farm_id = p_farm_id
  )
$$;

GRANT EXECUTE ON FUNCTION public.worker_assigned_to_farm(uuid) TO authenticated;

DROP POLICY IF EXISTS farms_select ON farms;

CREATE POLICY farms_select ON farms
  FOR SELECT USING (
    organization_id = current_org_id()
    AND (
      is_owner()
      OR EXISTS (
        SELECT 1 FROM user_farm_assignments a
        WHERE a.farm_id = farms.id AND a.user_id = auth.uid()
      )
      OR worker_assigned_to_farm(id)
    )
  );
