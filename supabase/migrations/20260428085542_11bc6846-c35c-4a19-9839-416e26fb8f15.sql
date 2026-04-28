
DROP FUNCTION IF EXISTS public.bootstrap_first_owner() CASCADE;

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'developer';

CREATE TABLE IF NOT EXISTS public.setup_tokens (
  token TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ,
  used_by UUID
);
ALTER TABLE public.setup_tokens ENABLE ROW LEVEL SECURITY;

INSERT INTO public.setup_tokens (token) VALUES ('vJMTmRtMxrGhk05Hc7WEWdTeQREomS_p')
ON CONFLICT (token) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_role_key') THEN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
  END IF;
END $$;
