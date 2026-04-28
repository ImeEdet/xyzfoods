import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type StaffRole = "owner" | "chef" | "developer";

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

  const refreshRoles = async () => {
    if (user) await loadRoles(user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRoles([]);
  };

  const isOwner = roles.includes("owner");
  const isChef = roles.includes("chef");
  const isDeveloper = roles.includes("developer");
  const canManageStaff = isOwner || isDeveloper;
  const canEditMenu = isOwner || isChef;
  const isStaff = isOwner || isChef || isDeveloper;

  return { session, user, roles, loading, isStaff, isOwner, isChef, isDeveloper, canManageStaff, canEditMenu, signOut, refreshRoles };
};
