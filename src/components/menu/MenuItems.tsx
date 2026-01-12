import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Plus } from "lucide-react";
import { MenuItem, menuData, Ingredient, SpecialInstructions } from "@/types/menu";
import { CustomMealBuilder } from "./CustomMealBuilder";

interface MenuItemsProps {
  onAddToCart: (item: MenuItem) => void;
  onAddCustomMeal: (meal: {
    name: string;
    price: number;
    time: number;
    ingredients: Ingredient[];
    instructions: SpecialInstructions;
  }) => void;
}

export const MenuItems = ({ onAddToCart, onAddCustomMeal }: MenuItemsProps) => {
  return (
    <div className="space-y-8">
      {/* Custom Meal Builder at the top */}
      <CustomMealBuilder onAddToCart={onAddCustomMeal} />

      {/* Regular Menu Items */}
      {Object.entries(menuData).map(([category, items]) => (
        <div key={category}>
          <h2 className="text-2xl font-bold capitalize mb-4 font-serif text-foreground">
            {category}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {items.map((item) => (
              <Card key={item.id} className="bg-card border-border overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {item.category}
                      </Badge>
                    </div>
                    <span className="font-bold text-primary">₦{item.price.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.time} min
                    </span>
                    <Button
                      size="sm"
                      onClick={() => onAddToCart(item)}
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