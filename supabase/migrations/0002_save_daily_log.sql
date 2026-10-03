-- Atomic daily log save. Updates must set flockops.edit_reason for the audit trigger.

CREATE OR REPLACE FUNCTION public.save_daily_log(
  p_flock_id uuid,
  p_log_date date,
  p_mortality integer,
  p_culls integer,
  p_feed_consumed_kg numeric,
  p_water_liters numeric,
  p_sample_weight_grams numeric,
  p_notes text,
  p_reason text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  log_id uuid;
BEGIN
  IF p_mortality < 0 OR p_culls < 0 OR p_feed_consumed_kg < 0 OR p_water_liters < 0 THEN
    RAISE EXCEPTION 'Daily figures cannot be negative';
  END IF;

  SELECT id INTO log_id
  FROM daily_logs
  WHERE flock_id = p_flock_id
    AND log_date = p_log_date;

  IF log_id IS NOT NULL THEN
    IF NULLIF(btrim(COALESCE(p_reason, '')), '') IS NULL THEN
      RAISE EXCEPTION 'A reason is required to update a daily log';
    END IF;

    PERFORM set_config('flockops.edit_reason', p_reason, true);

    UPDATE daily_logs
    SET
      mortality = p_mortality,
      culls = p_culls,
      feed_consumed_kg = p_feed_consumed_kg,
      water_liters = p_water_liters,
      sample_weight_grams = p_sample_weight_grams,
      notes = NULLIF(btrim(COALESCE(p_notes, '')), '')
    WHERE id = log_id;

    RETURN log_id;
  END IF;

  INSERT INTO daily_logs (
    flock_id,
    log_date,
    mortality,
    culls,
    feed_consumed_kg,
    water_liters,
    sample_weight_grams,
    notes,
    recorded_by
  ) VALUES (
    p_flock_id,
    p_log_date,
    p_mortality,
    p_culls,
    p_feed_consumed_kg,
    p_water_liters,
    p_sample_weight_grams,
    NULLIF(btrim(COALESCE(p_notes, '')), ''),
    auth.uid()
  )
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_daily_log(
  uuid, date, integer, integer, numeric, numeric, numeric, text, text
) TO authenticated;
