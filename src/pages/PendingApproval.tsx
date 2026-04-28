import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hourglass } from "lucide-react";
import { useStaffAuth } from "@/hooks/useStaffAuth";

const PendingApproval = () => {
  const { user, signOut } = useStaffAuth();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            <Hourglass className="w-7 h-7 text-muted-foreground" />
          </div>
          <CardTitle className="font-serif text-2xl">Awaiting Approval</CardTitle>
          <CardDescription>
            Your account ({user?.email}) is signed in but has no staff role yet. Ask the owner or developer to grant you access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={signOut} variant="outline" className="w-full">Sign out</Button>
          <Button asChild variant="ghost" className="w-full"><Link to="/">Back to site</Link></Button>
          <Button asChild variant="ghost" className="w-full text-xs"><Link to="/admin/setup">Have a setup token?</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApproval;
