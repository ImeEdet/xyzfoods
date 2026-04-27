import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Plus } from "lucide-react";
import { MenuItem, Ingredient, SpecialInstructions } from "@/types/menu";
import { CustomMealBuilder } from "./CustomMealBuilder";
import { DbMenuItem, DbIngredient, AppSettings } from "@/hooks/useMenu";

interface MenuItemsProps {
  items: DbMenuItem[];
  ingredients: DbIngredient[];
  settings: AppSettings;
  onAddToCart: (item: MenuItem) => void;
  onAddCustomMeal: (meal: {
    name: string;
    price: number;
    time: number;
    ingredients: Ingredient[];
    instructions: SpecialInstructions;
  }) => void;
}

export const MenuItems = ({ items, ingredients, settings, onAddToCart, onAddCustomMeal }: MenuItemsProps) => {
  const visible = items.filter((i) => i.available);
  const grouped = visible.reduce<Record<string, DbMenuItem[]>>((acc, item) => {
    (acc[item.category] ||= []).push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <CustomMealBuilder ingredients={ingredients} settings={settings} onAddToCart={onAddCustomMeal} />

      {Object.entries(grouped).map(([category, list]) => (
        <div key={category}>
          <h2 className="text-2xl font-bold capitalize mb-4 font-serif text-foreground">{category}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {list.map((item) => (
              <Card key={item.id} className="bg-card border-border overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <Badge variant="secondary" className="text-xs mt-1">{item.cuisine}</Badge>
                    </div>
                    <span className="font-bold text-primary">₦{item.price.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.prep_time} min
                    </span>
                    <Button
                      size="sm"
                      onClick={() => onAddToCart({
                        id: hashId(item.id),
                        name: item.name,
                        price: item.price,
                        time: item.prep_time,
                        description: item.description,
                        category: item.cuisine,
                      })}
                      className="gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Convert UUID to numeric id for legacy CartItem shape
function hashId(uuid: string): number {
  let h = 0;
  for (let i = 0; i < uuid.length; i++) h = ((h << 5) - h + uuid.charCodeAt(i)) | 0;
  return Math.abs(h);
}
