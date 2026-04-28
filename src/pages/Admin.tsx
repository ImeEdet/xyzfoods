import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMenu } from "@/hooks/useMenu";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { MenuItemsTable } from "@/components/admin/MenuItemsTable";
import { IngredientsTable } from "@/components/admin/IngredientsTable";
import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { StaffTable } from "@/components/admin/StaffTable";
import { LogOut, Loader2 } from "lucide-react";

const Admin = () => {
  const { items, ingredients, settings, loading } = useMenu();
  const { user, isOwner, isChef, isDeveloper, canManageStaff, canEditMenu, signOut } = useStaffAuth();

  const roleLabel = isOwner ? "Owner" : isDeveloper ? "Developer" : isChef ? "Chef" : "Staff";
  const defaultTab = canEditMenu ? "items" : "staff";

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl font-bold">XYZ Foods · Staff Dashboard</h1>
            <p className="text-xs text-muted-foreground">{user?.email} · <Badge variant="secondary" className="ml-1">{roleLabel}</Badge></p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm"><Link to="/">View Site</Link></Button>
            <Button onClick={signOut} variant="ghost" size="sm"><LogOut className="w-4 h-4 mr-1" /> Sign out</Button>
          </div>
        </div>
      </nav>
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <Tabs defaultValue={defaultTab}>
            <TabsList>
              {canEditMenu && <TabsTrigger value="items">Menu Items</TabsTrigger>}
              {canEditMenu && <TabsTrigger value="ingredients">Ingredients</TabsTrigger>}
              {canEditMenu && <TabsTrigger value="settings">Settings</TabsTrigger>}
              {canManageStaff && <TabsTrigger value="staff">Staff</TabsTrigger>}
            </TabsList>
            {canEditMenu && <TabsContent value="items" className="mt-6"><MenuItemsTable items={items} /></TabsContent>}
            {canEditMenu && <TabsContent value="ingredients" className="mt-6"><IngredientsTable ingredients={ingredients} /></TabsContent>}
            {canEditMenu && <TabsContent value="settings" className="mt-6"><SettingsPanel settings={settings} isOwner={isOwner} /></TabsContent>}
            {canManageStaff && <TabsContent value="staff" className="mt-6"><StaffTable /></TabsContent>}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Admin;
