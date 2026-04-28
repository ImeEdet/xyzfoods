import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AdminSetup = () => {
  const navigate = useNavigate();
  const { user, loading, isStaff, refreshRoles } = useStaffAuth();
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/admin/login", { replace: true });
  }, [loading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.rpc("claim_developer_role", { _token: token.trim() });
      if (error) throw error;
      toast.success("Developer role granted");
      await refreshRoles();
      navigate("/admin", { replace: true });
    } catch (err: any) {
      toast.error(err.message ?? "Failed to claim token");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="font-serif text-2xl">Builder Setup</CardTitle>
          <CardDescription>
            Enter the one-time setup token to claim the <strong>developer</strong> role. From there you can grant the owner role to the actual app owner.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isStaff && (
            <p className="text-sm text-muted-foreground mb-4 text-center">You already have a staff role. <Link to="/admin" className="underline">Open dashboard</Link></p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="token">Setup token</Label>
              <Input id="token" required value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste token here" />
            </div>
            <Button type="submit" className="w-full" disabled={busy || !token.trim()}>
              {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Claim developer role
            </Button>
          </form>
          <Link to="/admin/login" className="block text-center text-xs text-muted-foreground mt-4 hover:text-foreground">← Back to login</Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;
