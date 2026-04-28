import { Navigate } from "react-router-dom";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { Loader2 } from "lucide-react";

export const RequireStaff = ({ children }: { children: React.ReactNode }) => {
  const { loading, isStaff, user } = useStaffAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isStaff) return <Navigate to="/admin/pending" replace />;
  return <>{children}</>;
};
