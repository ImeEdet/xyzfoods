import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Plus, ChefHat } from "lucide-react";
import { motion } from "framer-motion";
import { MenuItem, Ingredient, SpecialInstructions } from "@/types/menu";
import { CustomMealBuilder } from "./CustomMealBuilder";
import { DbMenuItem, DbIngredient, AppSettings } from "@/hooks/useMenu";

import dishJollof from "@/assets/dish-jollof.jpg";
import dishEgusi from "@/assets/dish-egusi.jpg";
import dishGrill from "@/assets/dish-grill.jpg";
import dishPasta from "@/assets/dish-pasta.jpg";

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

const cuisineImage = (cuisine: string, name: string): string => {
  const n = name.toLowerCase();
  const c = cuisine.toLowerCase();
  if (n.includes("jollof") || n.includes("rice")) return dishJollof;
  if (n.includes("egusi") || n.includes("yam") || n.includes("soup")) return dishEgusi;
  if (n.includes("pasta") || n.includes("spaghetti") || c.includes("italian")) return dishPasta;
  if (n.includes("grill") || n.includes("chicken") || n.includes("salmon")) return dishGrill;
  if (c.includes("nigerian")) return dishJollof;
  if (c.includes("italian")) return dishPasta;
  return dishGrill;
};

export const MenuItems = ({ items, ingredients, settings, onAddToCart, onAddCustomMeal }: MenuItemsProps) => {
  const visible = items.filter((i) => i.available);
  const grouped = visible.reduce<Record<string, DbMenuItem[]>>((acc, item) => {
    (acc[item.category] ||= []).push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-12">
      <CustomMealBuilder ingredients={ingredients} settings={settings} onAddToCart={onAddCustomMeal} />

      {Object.entries(grouped).map(([category, list]) => (
        <section key={category}>
          <div className="flex items-end justify-between mb-5">
            <div>
              <span className="eyebrow"><span className="gold-rule" />The Menu</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold capitalize mt-1 text-foreground">
                {category}
              </h2>
            </div>
            <span className="text-xs text-muted-foreground">{list.length} dishes</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {list.map((item, i) => {
              const img = cuisineImage(item.cuisine, item.name);
              return (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
                  className="group relative overflow-hidden rounded-sm bg-card border border-border shadow-soft hover:shadow-card transition-shadow"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={img}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                    <span className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.2em] font-medium px-2.5 py-1 rounded-full bg-background/90 text-foreground">
                      {item.cuisine}
                    </span>
                    <span className="absolute top-3 right-3 text-sm font-bold px-3 py-1 rounded-full gradient-sun text-primary-foreground shadow-warm">
                      ₦{item.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="font-display text-xl font-semibold text-foreground leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between mt-4">
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
                        className="rounded-full h-9 px-4 gap-1 gradient-sun text-primary-foreground border-0 hover:opacity-95"
                      >
                        <Plus className="w-4 h-4" /> Add
                      </Button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>
      ))}

      {visible.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-sm">
          <ChefHat className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">The kitchen is preparing the menu — check back soon.</p>
        </div>
      )}
    </div>
  );
};

function hashId(uuid: string): number {
  let h = 0;
  for (let i = 0; i < uuid.length; i++) h = ((h << 5) - h + uuid.charCodeAt(i)) | 0;
  return Math.abs(h);
}
