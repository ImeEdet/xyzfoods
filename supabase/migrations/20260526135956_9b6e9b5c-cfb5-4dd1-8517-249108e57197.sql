CREATE TYPE public.access_request_status AS ENUM ('pending','approved','denied');

CREATE TABLE public.access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  requested_role public.app_role NOT NULL DEFAULT 'chef',
  note TEXT,
  status public.access_request_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT access_requests_role_not_developer CHECK (requested_role <> 'developer')
);

CREATE UNIQUE INDEX access_requests_one_pending_per_user
  ON public.access_requests (user_id) WHERE status = 'pending';

GRANT SELECT, INSERT, UPDATE ON public.access_requests TO authenticated;
GRANT ALL ON public.access_requests TO service_role;

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own request"
  ON public.access_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "View own or staff managers view all"
  ON public.access_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.can_manage_staff(auth.uid()));

CREATE POLICY "Staff managers update requests"
  ON public.access_requests FOR UPDATE TO authenticated
  USING (public.can_manage_staff(auth.uid()))
  WITH CHECK (public.can_manage_staff(auth.uid()));

CREATE TRIGGER access_requests_touch_updated_at
  BEFORE UPDATE ON public.access_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Approve helper: atomic role grant + status update, runs as staff manager
CREATE OR REPLACE FUNCTION public.approve_access_request(_request_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_req public.access_requests%ROWTYPE;
BEGIN
  IF NOT public.can_manage_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  SELECT * INTO v_req FROM public.access_requests WHERE id = _request_id AND status = 'pending' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Request not found or already reviewed'; END IF;
  IF v_req.requested_role = 'owner' AND NOT public.has_role(auth.uid(), 'owner') THEN
    RAISE EXCEPTION 'Only owners can approve owner requests';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_req.user_id, v_req.requested_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  UPDATE public.access_requests
    SET status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
    WHERE id = _request_id;
END;
$$;