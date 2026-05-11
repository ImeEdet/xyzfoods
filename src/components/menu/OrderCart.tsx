import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Plus, Minus, CreditCard, ChefHat, Utensils } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CartItem, SpecialInstructions } from "@/types/menu";
import { ItemInstructions } from "./ItemInstructions";

interface OrderCartProps {
  cart: CartItem[];
  tableNumber: number | null;
  onUpdateQuantity: (id: number, delta: number) => void;
  onUpdateInstructions: (id: number, instructions: SpecialInstructions) => void;
  onPlaceOrder: () => void;
  isPlacingOrder?: boolean;
}

export const OrderCart = ({
  cart,
  tableNumber,
  onUpdateQuantity,
  onUpdateInstructions,
  onPlaceOrder,
  isPlacingOrder = false,
}: OrderCartProps) => {
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const maxPrepTime = cart.length > 0 ? Math.max(...cart.map((item) => item.time)) : 0;
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  const formatInstructions = (instructions?: SpecialInstructions) => {
    if (!instructions) return null;
    const parts: string[] = [];
    if (instructions.commonOptions.length > 0) parts.push(instructions.commonOptions.join(", "));
    if (instructions.customNote) parts.push(instructions.customNote);
    return parts.length > 0 ? parts.join(" • ") : null;
  };

  return (
    <Card className="sticky top-36 bg-card border-border shadow-card overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-border bg-muted/30">
        <span className="eyebrow"><span className="gold-rule" />Your Table</span>
        <div className="flex items-center justify-between mt-1.5">
          <h3 className="font-display text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" /> Order
          </h3>
          {itemCount > 0 && (
            <span className="text-sm font-medium text-muted-foreground">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
          )}
        </div>
        {tableNumber && (
          <p className="text-xs text-muted-foreground mt-1">Serving Table {tableNumber}</p>
        )}
      </div>

      <CardContent className="p-5">
        {cart.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <Utensils className="w-6 h-6 text-muted-foreground/60" />
            </div>
            <p className="font-medium text-foreground">Your cart is empty</p>
            <p className="text-xs text-muted-foreground mt-1">Add a dish from the menu to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {cart.map((item) => {
                const instructionsText = formatInstructions(item.instructions);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {item.isCustomMeal && <ChefHat className="w-3.5 h-3.5 text-primary shrink-0" />}
                          <p className="font-medium text-sm truncate">{item.name}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ₦{item.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-muted/50 rounded-full p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full hover:bg-background"
                          onClick={() => onUpdateQuantity(item.id, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full hover:bg-background"
                          onClick={() => onUpdateQuantity(item.id, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pl-1">
                      <ItemInstructions
                        itemName={item.name}
                        currentInstructions={item.instructions}
                        onSave={(instructions) => onUpdateInstructions(item.id, instructions)}
                      />
                      {instructionsText && (
                        <p className="text-xs text-muted-foreground italic flex-1 pt-1">{instructionsText}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <div className="border-t border-dashed border-border pt-4 mt-4 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Est. prep time</span>
                <span className="font-medium">{maxPrepTime} min</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-display text-2xl font-bold text-primary">
                  ₦{cartTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <Button
              className="w-full mt-2 h-12 rounded-full gap-2 gradient-sun text-primary-foreground border-0 shadow-warm hover:opacity-95"
              size="lg"
              onClick={onPlaceOrder}
              disabled={isPlacingOrder}
            >
              <CreditCard className="w-4 h-4" />
              {isPlacingOrder ? "Processing..." : "Place Order"}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              You'll be redirected to payment
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
