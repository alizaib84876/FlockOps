-- Optional expense receipt photos. Path is {organization_id}/{uuid}.ext

INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-receipts', 'expense-receipts', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS expense_receipts_select ON storage.objects;
CREATE POLICY expense_receipts_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'expense-receipts'
    AND (storage.foldername(name))[1] = public.current_org_id()::text
  );

DROP POLICY IF EXISTS expense_receipts_insert ON storage.objects;
CREATE POLICY expense_receipts_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'expense-receipts'
    AND (storage.foldername(name))[1] = public.current_org_id()::text
  );
