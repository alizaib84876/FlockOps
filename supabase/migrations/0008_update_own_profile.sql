-- Members may update their own name and phone. Role and organization stay server-controlled.

CREATE OR REPLACE FUNCTION public.update_own_profile(
  p_full_name varchar,
  p_phone_number varchar
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF NULLIF(btrim(COALESCE(p_full_name, '')), '') IS NULL THEN
    RAISE EXCEPTION 'Name is required';
  END IF;

  UPDATE users
  SET
    full_name = btrim(p_full_name),
    phone_number = NULLIF(btrim(COALESCE(p_phone_number, '')), '')
  WHERE id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_own_profile(varchar, varchar) TO authenticated;
