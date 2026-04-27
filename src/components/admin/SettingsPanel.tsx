import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppSettings } from "@/hooks/useMenu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const SettingsPanel = ({ settings, isOwner }: { settings: AppSettings; isOwner: boolean }) => {
  const [base, setBase] = useState(settings.customMealBasePrice);
  const [time, setTime] = useState(settings.customMealPrepTime);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const { error: e1 } = await supabase.from("app_settings").upsert({ key: "custom_meal_base_price", value: base as any });
    const { error: e2 } = await supabase.from("app_settings").upsert({ key: "custom_meal_prep_time", value: time as any });
    setBusy(false);
    if (e1 || e2) return toast.error(e1?.message || e2?.message || "Failed");
    toast.success("Settings saved");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Meal Settings</CardTitle>
        <CardDescription>
          {isOwner ? "Adjust the base price and prep time for build-your-own meals." : "Only the owner can edit settings."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-w-md">
        <div>
          <Label>Base price (₦)</Label>
          <Input type="number" value={base} onChange={(e) => setBase(Number(e.target.value))} disabled={!isOwner} />
        </div>
        <div>
          <Label>Base prep time (min)</Label>
          <Input type="number" value={time} onChange={(e) => setTime(Number(e.target.value))} disabled={!isOwner} />
        </div>
        <Button onClick={save} disabled={!isOwner || busy}>Save</Button>
      </CardContent>
    </Card>
  );
};
