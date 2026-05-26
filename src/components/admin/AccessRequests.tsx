import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useStaffAuth } from "@/hooks/useStaffAuth";

interface AccessRequest {
  id: string;
  user_id: string;
  email: string;
  requested_role: "owner" | "chef";
  note: string | null;
  status: "pending" | "approved" | "denied";
  created_at: string;
}

export const AccessRequests = () => {
  const { isOwner } = useStaffAuth();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("access_requests")
      .select("id,user_id,email,requested_role,note,status,created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRequests((data ?? []) as AccessRequest[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    setBusyId(id);
    const { error } = await supabase.rpc("approve_access_request", { _request_id: id });
    if (error) toast.error(error.message);
    else { toast.success("Approved"); await load(); }
    setBusyId(null);
  };

  const deny = async (id: string) => {
    setBusyId(id);
    const { error } = await supabase
      .from("access_requests")
      .update({ status: "denied", reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Denied"); await load(); }
    setBusyId(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Access Requests</CardTitle>
        <CardDescription>
          People asking to become staff. Approve to grant the requested role; deny to reject (they can re-request).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : requests.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No pending requests.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => {
                const canApprove = r.requested_role === "owner" ? isOwner : true;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.email}</TableCell>
                    <TableCell><Badge variant="secondary">{r.requested_role}</Badge></TableCell>
                    <TableCell className="max-w-[260px] text-xs text-muted-foreground truncate" title={r.note ?? ""}>{r.note || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => approve(r.id)} disabled={busyId === r.id || !canApprove} title={!canApprove ? "Only owners can approve owner requests" : ""}>
                          <Check className="w-3 h-3 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deny(r.id)} disabled={busyId === r.id}>
                          <X className="w-3 h-3 mr-1" /> Deny
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
