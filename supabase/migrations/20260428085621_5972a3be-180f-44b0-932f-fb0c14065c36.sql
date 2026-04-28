
-- Lock down setup_tokens (silence linter; access only via SECURITY DEFINER)
CREATE POLICY "No direct access to setup_tokens"
  ON public.setup_tokens FOR ALL
  TO authenticated, anon
  USING (false) WITH CHECK (false);

-- can_manage_staff helper
CREATE OR REPLACE FUNCTION public.can_manage_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('owner','developer')
  )
$$;

-- claim_developer_role
CREATE OR REPLACE FUNCTION public.claim_developer_role(_token TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  UPDATE public.setup_tokens SET used_at = now(), used_by = v_uid
    WHERE token = _token AND used_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invalid or already-used setup token'; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, 'developer')
    ON CONFLICT (user_id, role) DO NOTHING;
  RETURN 'ok';
END;
$$;
REVOKE ALL ON FUNCTION public.claim_developer_role(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_developer_role(TEXT) TO authenticated;

-- Guard trigger
CREATE OR REPLACE FUNCTION public.guard_user_roles()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_actor UUID := auth.uid();
  v_is_owner BOOLEAN := COALESCE(public.has_role(v_actor, 'owner'), false);
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.role = 'owner' AND NOT v_is_owner THEN
      -- Allow if no owner exists yet (shouldn't happen but safety) - actually no, force owner
      RAISE EXCEPTION 'Only owners can grant the owner role';
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.role = 'owner' THEN
      IF NOT v_is_owner THEN RAISE EXCEPTION 'Only owners can remove the owner role'; END IF;
      IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'owner') <= 1 THEN
        RAISE EXCEPTION 'Cannot remove the last owner';
      END IF;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;
DROP TRIGGER IF EXISTS guard_user_roles_trigger ON public.user_roles;
CREATE TRIGGER guard_user_roles_trigger
  BEFORE INSERT OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.guard_user_roles();

-- Update RLS on user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Owners can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Owners can delete roles" ON public.user_roles;

CREATE POLICY "View roles self or staff manager" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.can_manage_staff(auth.uid()));

CREATE POLICY "Insert roles staff managers" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_staff(auth.uid()));

CREATE POLICY "Delete roles staff managers" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.can_manage_staff(auth.uid()));

-- list_staff_users
CREATE OR REPLACE FUNCTION public.list_staff_users()
RETURNS TABLE(user_id UUID, email TEXT, created_at TIMESTAMPTZ, roles TEXT[])
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT u.id, u.email::text, u.created_at,
    COALESCE(array_agg(r.role::text) FILTER (WHERE r.role IS NOT NULL), ARRAY[]::text[])
  FROM auth.users u
  LEFT JOIN public.user_roles r ON r.user_id = u.id
  WHERE public.can_manage_staff(auth.uid())
  GROUP BY u.id, u.email, u.created_at
  ORDER BY u.created_at DESC;
$$;
REVOKE ALL ON FUNCTION public.list_staff_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_staff_users() TO authenticated;
