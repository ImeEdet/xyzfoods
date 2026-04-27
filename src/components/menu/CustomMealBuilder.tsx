import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChefHat, Plus, ShoppingCart, Utensils, Leaf, Droplets, Sparkles, Wheat } from "lucide-react";
import { Ingredient, commonInstructionOptions } from "@/types/menu";
import { DbIngredient, AppSettings } from "@/hooks/useMenu";

interface CustomMealBuilderProps {
  ingredients: DbIngredient[];
  settings: AppSettings;
  onAddToCart: (meal: {
    name: string;
    price: number;
    time: number;
    ingredients: Ingredient[];
    instructions: { commonOptions: string[]; customNote: string };
  }) => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  protein: Utensils,
  carb: Wheat,
  vegetable: Leaf,
  sauce: Droplets,
  extra: Sparkles,
};

const categoryLabels: Record<string, string> = {
  protein: "Proteins",
  carb: "Carbs & Starches",
  vegetable: "Vegetables",
  sauce: "Sauces & Soups",
  extra: "Extras",
};

export const CustomMealBuilder = ({ ingredients, settings, onAddToCart }: CustomMealBuilderProps) => {
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [selectedInstructions, setSelectedInstructions] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState("");

  const availableIngredients: Ingredient[] = ingredients
    .filter((i) => i.available)
    .map((i) => ({ id: i.id, name: i.name, price: i.price, category: i.category as Ingredient["category"] }));

  const toggleIngredient = (ingredient: Ingredient) => {
    setSelectedIngredients((prev) => {
      const exists = prev.find((i) => i.id === ingredient.id);
      if (exists) return prev.filter((i) => i.id !== ingredient.id);
      return [...prev, ingredient];
    });
  };

  const toggleInstruction = (instruction: string) => {
    setSelectedInstructions((prev) =>
      prev.includes(instruction) ? prev.filter((i) => i !== instruction) : [...prev, instruction]
    );
  };

  const basePrice = settings.customMealBasePrice;
  const totalPrice = basePrice + selectedIngredients.reduce((sum, i) => sum + i.price, 0);

  const handleAddToCart = () => {
    if (selectedIngredients.length === 0) return;
    const mealName = `Custom: ${selectedIngredients.slice(0, 3).map((i) => i.name).join(", ")}${selectedIngredients.length > 3 ? "..." : ""}`;
    onAddToCart({
      name: mealName,
      price: totalPrice,
      time: settings.customMealPrepTime,
      ingredients: selectedIngredients,
      instructions: { commonOptions: selectedInstructions, customNote },
    });
    setSelectedIngredients([]);
    setSelectedInstructions([]);
    setCustomNote("");
  };

  const groupedIngredients = availableIngredients.reduce((acc, ingredient) => {
    (acc[ingredient.category] ||= []).push(ingredient);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <ChefHat className="w-6 h-6 text-primary" />
          Build Your Own Meal
        </CardTitle>
        <CardDescription>
          Can't find what you want? Create a custom meal from our fresh ingredients.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ingredient Selection */}
        {(["protein", "carb", "vegetable", "sauce", "extra"] as const).map((category) => {
          const Icon = categoryIcons[category];
          return (
            <div key={category}>
              <h4 className="font-medium mb-3 flex items-center gap-2 text-foreground">
                <Icon className="w-4 h-4 text-primary" />
                {categoryLabels[category]}
              </h4>
              <div className="flex flex-wrap gap-2">
                {groupedIngredients[category]?.map((ingredient) => {
                  const isSelected = selectedIngredients.some((i) => i.id === ingredient.id);
                  return (
                    <Badge
                      key={ingredient.id}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        isSelected 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-primary/10"
                      }`}
                      onClick={() => toggleIngredient(ingredient)}
                    >
                      {ingredient.name}
                      <span className="ml-1 opacity-70">+₦{ingredient.price.toLocaleString()}</span>
                    </Badge>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Special Instructions */}
        <div className="border-t border-border pt-4">
          <h4 className="font-medium mb-3 text-foreground">Special Instructions</h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {commonInstructionOptions.map((option) => (
              <Badge
                key={option}
                variant={selectedInstructions.includes(option) ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  selectedInstructions.includes(option)
                    ? "bg-secondary text-secondary-foreground"
                    : "hover:bg-secondary/10"
                }`}
                onClick={() => toggleInstruction(option)}
              >
                {option}
              </Badge>
            ))}
          </div>
          <Textarea
            placeholder="Any other special requests? (e.g., 'extra crispy', 'separate sauce')"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            className="resize-none"
            rows={2}
          />
        </div>

        {/* Price Summary */}
        <div className="bg-background rounded-lg p-4 border border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground">Base Price:</span>
            <span>₦{basePrice.toLocaleString()}</span>
          </div>
          {selectedIngredients.length > 0 && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">
                Ingredients ({selectedIngredients.length}):
              </span>
              <span>
                +₦{selectedIngredients.reduce((sum, i) => sum + i.price, 0).toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center text-lg font-bold border-t border-border pt-2 mt-2">
            <span>Total:</span>
            <span className="text-primary">₦{totalPrice.toLocaleString()}</span>
          </div>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={selectedIngredients.length === 0}
          className="w-full gap-2"
          size="lg"
        >
          <ShoppingCart className="w-4 h-4" />
          Add Custom Meal to Cart
        </Button>
        {selectedIngredients.length === 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Select at least one ingredient to create your meal
          </p>
        )}
      </CardContent>
    </Card>
  );
};