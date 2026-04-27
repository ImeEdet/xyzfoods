import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type StaffRole = "owner" | "chef";

export const useStaffAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        // defer to avoid deadlock
        setTimeout(() => loadRoles(s.user!.id), 0);
      } else {
        setRoles([]);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) loadRoles(data.session.user.id);
      else setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const loadRoles = async (userId: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    setRoles((data?.map((r) => r.role) ?? []) as StaffRole[]);
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRoles([]);
  };

  const isStaff = roles.includes("owner") || roles.includes("chef");
  const isOwner = roles.includes("owner");

  return { session, user, roles, loading, isStaff, isOwner, signOut };
};
