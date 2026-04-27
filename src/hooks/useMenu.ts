import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DbMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  prep_time: number;
  category: string;
  cuisine: string;
  available: boolean;
  sort_order: number;
}

export interface DbIngredient {
  id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
}

export interface AppSettings {
  customMealBasePrice: number;
  customMealPrepTime: number;
}

export const useMenu = () => {
  const [items, setItems] = useState<DbMenuItem[]>([]);
  const [ingredients, setIngredients] = useState<DbIngredient[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    customMealBasePrice: 1000,
    customMealPrepTime: 30,
  });
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const [mi, ing, st] = await Promise.all([
      supabase.from("menu_items").select("*").order("sort_order"),
      supabase.from("ingredients").select("*").order("category").order("name"),
      supabase.from("app_settings").select("*"),
    ]);
    setItems((mi.data ?? []) as DbMenuItem[]);
    setIngredients((ing.data ?? []) as DbIngredient[]);
    if (st.data) {
      const map = Object.fromEntries(st.data.map((s: any) => [s.key, s.value]));
      setSettings({
        customMealBasePrice: Number(map["custom_meal_base_price"] ?? 1000),
        customMealPrepTime: Number(map["custom_meal_prep_time"] ?? 30),
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    const ch = supabase
      .channel("menu-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "ingredients" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "app_settings" }, fetchAll)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  return { items, ingredients, settings, loading, refetch: fetchAll };
};
