-- Audited corrections for expenses and sales. Original rows stay; history is insert-only.

CREATE TABLE expense_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  edited_by UUID REFERENCES users(id),
  field_name VARCHAR(50) NOT NULL,
  old_value TEXT NOT NULL,
  new_value TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX expense_edits_expense_id_idx ON expense_edits (expense_id, created_at DESC);

CREATE TABLE sale_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  edited_by UUID REFERENCES users(id),
  field_name VARCHAR(50) NOT NULL,
  old_value TEXT NOT NULL,
  new_value TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX sale_edits_sale_id_idx ON sale_edits (sale_id, created_at DESC);

CREATE OR REPLACE FUNCTION forbid_finance_edit_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Finance audit rows are immutable';
END;
$$;

CREATE TRIGGER expense_edits_no_update
  BEFORE UPDATE ON expense_edits
  FOR EACH ROW EXECUTE FUNCTION forbid_finance_edit_mutation();

CREATE TRIGGER expense_edits_no_delete
  BEFORE DELETE ON expense_edits
  FOR EACH ROW EXECUTE FUNCTION forbid_finance_edit_mutation();

CREATE TRIGGER sale_edits_no_update
  BEFORE UPDATE ON sale_edits
  FOR EACH ROW EXECUTE FUNCTION forbid_finance_edit_mutation();

CREATE TRIGGER sale_edits_no_delete
  BEFORE DELETE ON sale_edits
  FOR EACH ROW EXECUTE FUNCTION forbid_finance_edit_mutation();

CREATE OR REPLACE FUNCTION record_expense_edits()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  reason_text TEXT;
BEGIN
  reason_text := NULLIF(current_setting('flockops.edit_reason', true), '');
  IF reason_text IS NULL THEN
    RAISE EXCEPTION 'A reason is required to update an expense';
  END IF;

  IF OLD.farm_id IS DISTINCT FROM NEW.farm_id THEN
    INSERT INTO expense_edits (expense_id, edited_by, field_name, old_value, new_value, reason)
    VALUES (NEW.id, auth.uid(), 'farm_id', OLD.farm_id::TEXT, NEW.farm_id::TEXT, reason_text);
  END IF;
  IF OLD.flock_id IS DISTINCT FROM NEW.flock_id THEN
    INSERT INTO expense_edits (expense_id, edited_by, field_name, old_value, new_value, reason)
    VALUES (NEW.id, auth.uid(), 'flock_id', COALESCE(OLD.flock_id::TEXT, ''), COALESCE(NEW.flock_id::TEXT, ''), reason_text);
  END IF;
  IF OLD.category IS DISTINCT FROM NEW.category THEN
    INSERT INTO expense_edits (expense_id, edited_by, field_name, old_value, new_value, reason)
    VALUES (NEW.id, auth.uid(), 'category', OLD.category::TEXT, NEW.category::TEXT, reason_text);
  END IF;
  IF OLD.amount IS DISTINCT FROM NEW.amount THEN
    INSERT INTO expense_edits (expense_id, edited_by, field_name, old_value, new_value, reason)
    VALUES (NEW.id, auth.uid(), 'amount', OLD.amount::TEXT, NEW.amount::TEXT, reason_text);
  END IF;
  IF OLD.description IS DISTINCT FROM NEW.description THEN
    INSERT INTO expense_edits (expense_id, edited_by, field_name, old_value, new_value, reason)
    VALUES (NEW.id, auth.uid(), 'description', OLD.description, NEW.description, reason_text);
  END IF;
  IF OLD.expense_date IS DISTINCT FROM NEW.expense_date THEN
    INSERT INTO expense_edits (expense_id, edited_by, field_name, old_value, new_value, reason)
    VALUES (NEW.id, auth.uid(), 'expense_date', OLD.expense_date::TEXT, NEW.expense_date::TEXT, reason_text);
  END IF;
  IF OLD.receipt_url IS DISTINCT FROM NEW.receipt_url THEN
    INSERT INTO expense_edits (expense_id, edited_by, field_name, old_value, new_value, reason)
    VALUES (NEW.id, auth.uid(), 'receipt_url', COALESCE(OLD.receipt_url, ''), COALESCE(NEW.receipt_url, ''), reason_text);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER expenses_record_edits
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION record_expense_edits();

CREATE OR REPLACE FUNCTION record_sale_edits()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  reason_text TEXT;
BEGIN
  reason_text := NULLIF(current_setting('flockops.edit_reason', true), '');
  IF reason_text IS NULL THEN
    RAISE EXCEPTION 'A reason is required to update a sale';
  END IF;

  IF OLD.flock_id IS DISTINCT FROM NEW.flock_id THEN
    INSERT INTO sale_edits (sale_id, edited_by, field_name, old_value, new_value, reason)
    VALUES (NEW.id, auth.uid(), 'flock_id', OLD.flock_id::TEXT, NEW.flock_id::TEXT, reason_text);
  END IF;
  IF OLD.sale_date IS DISTINCT FROM NEW.sale_date THEN
    INSERT INTO sale_edits (sale_id, edited_by, field_name, old_value, new_value, reason)
    VALUES (NEW.id, auth.uid(), 'sale_date', OLD.sale_date::TEXT, NEW.sale_date::TEXT, reason_text);
  END IF;
  IF OLD.buyer_name IS DISTINCT FROM NEW.buyer_name THEN
    INSERT INTO sale_edits (sale_id, edited_by, field_name, old_value, new_value, reason)
    VALUES (NEW.id, auth.uid(), 'buyer_name', OLD.buyer_name, NEW.buyer_name, reason_text);
  END IF;
  IF OLD.empty_weight_kg IS DISTINCT FROM NEW.empty_weight_kg THEN
    INSERT INTO sale_edits (sale_id, edited_by, field_name, old_value, new_value, reason)
    VALUES (NEW.id, auth.uid(), 'empty_weight_kg', COALESCE(OLD.empty_weight_kg::TEXT, ''), COALESCE(NEW.empty_weight_kg::TEXT, ''), reason_text);
  END IF;
  IF OLD.loaded_weight_kg IS DISTINCT FROM NEW.loaded_weight_kg THEN
    INSERT INTO sale_edits (sale_id, edited_by, field_name, old_value, new_value, reason)
    VALUES (NEW.id, auth.uid(), 'loaded_weight_kg', COALESCE(OLD.loaded_weight_kg::TEXT, ''), COALESCE(NEW.loaded_weight_kg::TEXT, ''), reason_text);
  END IF;
  IF OLD.total_weight_kg IS DISTINCT FROM NEW.total_weight_kg THEN
    INSERT INTO sale_edits (sale_id, edited_by, field_name, old_value, new_value, reason)
    VALUES (NEW.id, auth.uid(), 'total_weight_kg', OLD.total_weight_kg::TEXT, NEW.total_weight_kg::TEXT, reason_text);
  END IF;
  IF OLD.price_per_kg IS DISTINCT FROM NEW.price_per_kg THEN
    INSERT INTO sale_edits (sale_id, edited_by, field_name, old_value, new_value, reason)
    VALUES (NEW.id, auth.uid(), 'price_per_kg', OLD.price_per_kg::TEXT, NEW.price_per_kg::TEXT, reason_text);
  END IF;
  IF OLD.driver_name IS DISTINCT FROM NEW.driver_name THEN
    INSERT INTO sale_edits (sale_id, edited_by, field_name, old_value, new_value, reason)
    VALUES (NEW.id, auth.uid(), 'driver_name', COALESCE(OLD.driver_name, ''), COALESCE(NEW.driver_name, ''), reason_text);
  END IF;
  IF OLD.notes IS DISTINCT FROM NEW.notes THEN
    INSERT INTO sale_edits (sale_id, edited_by, field_name, old_value, new_value, reason)
    VALUES (NEW.id, auth.uid(), 'notes', COALESCE(OLD.notes, ''), COALESCE(NEW.notes, ''), reason_text);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER sales_record_edits
  BEFORE UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION record_sale_edits();

ALTER TABLE expense_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_edits ENABLE ROW LEVEL SECURITY;

CREATE POLICY expenses_update ON expenses
  FOR UPDATE USING (
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
  )
  WITH CHECK (
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

CREATE POLICY expense_edits_select ON expense_edits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM expenses e
      JOIN farms f ON f.id = e.farm_id
      JOIN users u ON u.id = auth.uid()
      WHERE e.id = expense_edits.expense_id
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

CREATE POLICY expense_edits_insert ON expense_edits
  FOR INSERT WITH CHECK (true);

CREATE POLICY sale_edits_select ON sale_edits
  FOR SELECT USING (is_owner());

CREATE POLICY sale_edits_insert ON sale_edits
  FOR INSERT WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_expense(
  p_id uuid,
  p_farm_id uuid,
  p_flock_id uuid,
  p_category expense_category,
  p_amount numeric,
  p_description text,
  p_expense_date date,
  p_receipt_url text,
  p_reason text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NULLIF(btrim(COALESCE(p_reason, '')), '') IS NULL THEN
    RAISE EXCEPTION 'A reason is required to update an expense';
  END IF;

  PERFORM set_config('flockops.edit_reason', p_reason, true);

  UPDATE expenses
  SET
    farm_id = p_farm_id,
    flock_id = p_flock_id,
    category = p_category,
    amount = p_amount,
    description = p_description,
    expense_date = p_expense_date,
    receipt_url = NULLIF(btrim(COALESCE(p_receipt_url, '')), '')
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Expense not found';
  END IF;

  RETURN p_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_sale(
  p_id uuid,
  p_flock_id uuid,
  p_sale_date date,
  p_buyer_name text,
  p_empty_weight_kg numeric,
  p_loaded_weight_kg numeric,
  p_price_per_kg numeric,
  p_driver_name text,
  p_notes text,
  p_reason text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NULLIF(btrim(COALESCE(p_reason, '')), '') IS NULL THEN
    RAISE EXCEPTION 'A reason is required to update a sale';
  END IF;
  IF p_loaded_weight_kg <= p_empty_weight_kg THEN
    RAISE EXCEPTION 'Loaded weight must be greater than the empty vehicle weight';
  END IF;

  PERFORM set_config('flockops.edit_reason', p_reason, true);

  UPDATE sales
  SET
    flock_id = p_flock_id,
    sale_date = p_sale_date,
    buyer_name = p_buyer_name,
    empty_weight_kg = p_empty_weight_kg,
    loaded_weight_kg = p_loaded_weight_kg,
    total_weight_kg = p_loaded_weight_kg - p_empty_weight_kg,
    price_per_kg = p_price_per_kg,
    driver_name = NULLIF(btrim(COALESCE(p_driver_name, '')), ''),
    notes = NULLIF(btrim(COALESCE(p_notes, '')), '')
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sale not found';
  END IF;

  RETURN p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_expense(uuid, uuid, uuid, expense_category, numeric, text, date, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_sale(uuid, uuid, date, text, numeric, numeric, numeric, text, text, text) TO authenticated;

REVOKE UPDATE, DELETE ON expense_edits FROM PUBLIC;
REVOKE UPDATE, DELETE ON expense_edits FROM anon, authenticated;
REVOKE UPDATE, DELETE ON sale_edits FROM PUBLIC;
REVOKE UPDATE, DELETE ON sale_edits FROM anon, authenticated;
