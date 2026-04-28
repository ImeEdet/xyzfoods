import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useStaffAuth } from "@/hooks/useStaffAuth";

type Role = "owner" | "chef" | "developer";

interface StaffUser {
  user_id: string;
  email: string;
  created_at: string;
  roles: Role[];
}

export const StaffTable = () => {
  const { user, isOwner } = useStaffAuth();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("list_staff_users");
    if (error) toast.error(error.message);
    setUsers((data ?? []) as StaffUser[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const grant = async (userId: string, role: Role) => {
    setBusyId(userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) toast.error(error.message);
    else { toast.success(`Granted ${role}`); await load(); }
    setBusyId(null);
  };

  const revoke = async (userId: string, role: Role) => {
    setBusyId(userId);
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    if (error) toast.error(error.message);
    else { toast.success(`Removed ${role}`); await load(); }
    setBusyId(null);
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  const allRoles: Role[] = ["owner", "chef", "developer"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff & Roles</CardTitle>
        <CardDescription>
          Grant or revoke roles. Only owners can manage the owner role. The last owner cannot be removed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[280px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const missing = allRoles.filter((r) => !u.roles.includes(r));
              const isSelf = u.user_id === user?.id;
              return (
                <TableRow key={u.user_id}>
                  <TableCell className="font-medium">{u.email}{isSelf && <span className="text-xs text-muted-foreground ml-1">(you)</span>}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {u.roles.length === 0 && <span className="text-xs text-muted-foreground">no roles</span>}
                      {u.roles.map((r) => {
                        const canRevoke = r === "owner" ? isOwner : true;
                        return (
                          <Badge key={r} variant={r === "owner" ? "default" : "secondary"} className="gap-1">
                            {r}
                            {canRevoke && (
                              <button
                                onClick={() => revoke(u.user_id, r)}
                                disabled={busyId === u.user_id}
                                className="ml-1 hover:text-destructive"
                                title={`Remove ${r}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </Badge>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {missing.length > 0 && (
                      <Select onValueChange={(val) => grant(u.user_id, val as Role)} disabled={busyId === u.user_id}>
                        <SelectTrigger className="h-8 w-[180px]"><SelectValue placeholder="Grant role…" /></SelectTrigger>
                        <SelectContent>
                          {missing.map((r) => (
                            <SelectItem key={r} value={r} disabled={r === "owner" && !isOwner}>
                              <span className="flex items-center gap-2"><Plus className="w-3 h-3" /> {r}{r === "owner" && !isOwner ? " (owner only)" : ""}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
