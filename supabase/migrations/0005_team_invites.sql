-- Team invites. Signup metadata invite_token is resolved server-side; role/org are not trusted from the client.

CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  role user_role NOT NULL CHECK (role IN ('SUPERVISOR', 'WORKER')),
  token TEXT NOT NULL UNIQUE,
  farm_ids UUID[] NOT NULL DEFAULT '{}',
  shed_ids UUID[] NOT NULL DEFAULT '{}',
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '14 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX invites_org_idx ON invites (organization_id, created_at DESC);
CREATE INDEX invites_token_idx ON invites (token);

ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY invites_owner_all ON invites
  FOR ALL USING (is_owner() AND organization_id = current_org_id())
  WITH CHECK (is_owner() AND organization_id = current_org_id());

CREATE OR REPLACE FUNCTION public.get_invite_preview(p_token text)
RETURNS TABLE (
  organization_name varchar,
  invite_role user_role,
  full_name varchar,
  email varchar,
  expired boolean,
  accepted boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    o.name,
    i.role,
    i.full_name,
    i.email,
    i.expires_at < NOW(),
    i.accepted_at IS NOT NULL
  FROM invites i
  JOIN organizations o ON o.id = i.organization_id
  WHERE i.token = p_token
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.get_invite_preview(text) TO anon, authenticated;

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
  invite_token TEXT;
  invite_row invites%ROWTYPE;
  farm_id UUID;
  shed_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;

  invite_token := NULLIF(NEW.raw_user_meta_data->>'invite_token', '');

  IF invite_token IS NOT NULL THEN
    SELECT * INTO invite_row FROM invites WHERE token = invite_token;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Invite is not valid';
    END IF;
    IF invite_row.accepted_at IS NOT NULL THEN
      RAISE EXCEPTION 'Invite has already been used';
    END IF;
    IF invite_row.expires_at < NOW() THEN
      RAISE EXCEPTION 'Invite has expired';
    END IF;
    IF lower(invite_row.email) <> lower(COALESCE(NEW.email, '')) THEN
      RAISE EXCEPTION 'Invite email does not match';
    END IF;

    INSERT INTO public.users (
      id, organization_id, full_name, phone_number, role, status
    ) VALUES (
      NEW.id,
      invite_row.organization_id,
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), invite_row.full_name),
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'phone_number', ''), invite_row.phone_number),
      invite_row.role,
      'ACTIVE'
    );

    FOREACH farm_id IN ARRAY invite_row.farm_ids LOOP
      INSERT INTO user_farm_assignments (user_id, farm_id)
      VALUES (NEW.id, farm_id)
      ON CONFLICT DO NOTHING;
    END LOOP;

    FOREACH shed_id IN ARRAY invite_row.shed_ids LOOP
      INSERT INTO user_shed_assignments (user_id, shed_id)
      VALUES (NEW.id, shed_id)
      ON CONFLICT DO NOTHING;
    END LOOP;

    UPDATE invites SET accepted_at = NOW() WHERE id = invite_row.id;
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
