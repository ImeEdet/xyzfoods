import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Hourglass, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { toast } from "sonner";

type Status = "pending" | "approved" | "denied";

const PendingApproval = () => {
  const { user, signOut } = useStaffAuth();
  const [existing, setExisting] = useState<{ status: Status; requested_role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [requestedRole, setRequestedRole] = useState<"chef" | "owner">("chef");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("access_requests")
        .select("status,requested_role")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setExisting(data as any);
      setLoading(false);
    })();
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (note.length > 500) { toast.error("Note must be 500 characters or fewer"); return; }
    setBusy(true);
    const { error } = await supabase.from("access_requests").insert({
      user_id: user.id,
      email: user.email!,
      requested_role: requestedRole,
      note: note.trim() || null,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Request submitted");
      setExisting({ status: "pending", requested_role: requestedRole });
    }
    setBusy(false);
  };

  const renderBody = () => {
    if (loading) return <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

    if (existing?.status === "pending") {
      return (
        <div className="rounded-md border border-border bg-muted/40 p-4 text-center">
          <Hourglass className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">Request pending</p>
          <p className="text-xs text-muted-foreground mt-1">You asked for the <strong>{existing.requested_role}</strong> role. An owner or developer will review it soon.</p>
        </div>
      );
    }

    if (existing?.status === "approved") {
      return (
        <div className="rounded-md border border-border bg-muted/40 p-4 text-center">
          <CheckCircle2 className="w-5 h-5 mx-auto mb-2 text-primary" />
          <p className="text-sm">Your previous request was approved. <Link to="/admin" className="underline">Open dashboard</Link></p>
        </div>
      );
    }

    return (
      <form onSubmit={submit} className="space-y-3">
        {existing?.status === "denied" && (
          <div className="rounded-md border border-border bg-muted/40 p-3 text-xs flex items-start gap-2">
            <XCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
            <span>Your previous request was denied. You may submit a new one.</span>
          </div>
        )}
        <div>
          <Label htmlFor="role">Requested role</Label>
          <Select value={requestedRole} onValueChange={(v) => setRequestedRole(v as any)}>
            <SelectTrigger id="role"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="chef">Chef — manage menu items & ingredients</SelectItem>
              <SelectItem value="owner">Owner — full access (only owners can approve)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="note">Note (optional)</Label>
          <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Briefly tell the team who you are" maxLength={500} rows={3} />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Request access
        </Button>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            <Hourglass className="w-7 h-7 text-muted-foreground" />
          </div>
          <CardTitle className="font-serif text-2xl">Staff Access</CardTitle>
          <CardDescription>
            Signed in as {user?.email}. Request a staff role and a manager will review it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderBody()}
          <div className="space-y-2 pt-2 border-t border-border">
            <Button onClick={signOut} variant="outline" className="w-full">Sign out</Button>
            <Button asChild variant="ghost" className="w-full"><Link to="/">Back to site</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApproval;
