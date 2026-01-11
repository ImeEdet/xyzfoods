import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Plus, Minus, CreditCard } from "lucide-react";
import { CartItem } from "@/types/menu";

interface OrderCartProps {
  cart: CartItem[];
  tableNumber: number | null;
  onUpdateQuantity: (id: number, delta: number) => void;
  onPlaceOrder: () => void;
  isPlacingOrder?: boolean;
}

export const OrderCart = ({
  cart,
  tableNumber,
  onUpdateQuantity,
  onPlaceOrder,
  isPlacingOrder = false,
}: OrderCartProps) => {
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const maxPrepTime = cart.length > 0 ? Math.max(...cart.map((item) => item.time)) : 0;

  return (
    <Card className="sticky top-36 bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <ShoppingCart className="w-5 h-5" /> Your Order
        </CardTitle>
        {tableNumber && (
          <CardDescription>Table {tableNumber}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {cart.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Your cart is empty
          </p>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ₦{item.price.toLocaleString()} each
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(item.id, -1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(item.id, 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="border-t border-border pt-4 mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Est. Prep Time:</span>
                <span className="font-medium">{maxPrepTime} min</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">₦{cartTotal.toLocaleString()}</span>
              </div>
            </div>

            <Button 
              className="w-full mt-4 gap-2" 
              size="lg"
              onClick={onPlaceOrder}
              disabled={isPlacingOrder}
            >
              <CreditCard className="w-4 h-4" />
              {isPlacingOrder ? "Processing..." : "Place Order"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              You'll be redirected to payment
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
