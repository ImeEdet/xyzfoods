import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UtensilsCrossed, MapPin } from "lucide-react";
import { toast } from "sonner";

import { CartItem, MenuItem, Ingredient, SpecialInstructions } from "@/types/menu";
import { useOrders } from "@/hooks/useOrders";
import { useMenu } from "@/hooks/useMenu";
import { MenuItems } from "@/components/menu/MenuItems";
import { OrderCart } from "@/components/menu/OrderCart";
import { OrderTracking } from "@/components/menu/OrderTracking";
import { ReservationForm } from "@/components/menu/ReservationForm";

const Menu = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("menu");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState({ firstName: "", lastName: "" });
  const [showNamePrompt, setShowNamePrompt] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [customMealCounter, setCustomMealCounter] = useState(1000); // Start at 1000 for custom meal IDs

  const {
    orders,
    createOrder,
    updateOrderStatus,
    getActiveOrders,
    getPendingPaymentOrders,
    getOrderHistory,
    simulatePayment,
  } = useOrders();

  // Sequential table numbering with daily reset (1-100)
  const getNextTableNumber = (): number => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem("xyz_table_date");
    let currentNumber = parseInt(localStorage.getItem("xyz_table_counter") || "0");

    if (storedDate !== today) {
      currentNumber = 0;
      localStorage.setItem("xyz_table_date", today);
    }

    const nextNumber = (currentNumber % 100) + 1;
    localStorage.setItem("xyz_table_counter", nextNumber.toString());
    return nextNumber;
  };

  // Auto-detect table number from URL or assign sequentially
  useEffect(() => {
    const table = searchParams.get("table");
    if (table) {
      setTableNumber(parseInt(table));
    } else {
      setTableNumber(getNextTableNumber());
    }

    const tab = searchParams.get("tab");
    if (tab === "reservation") {
      setActiveTab("reservation");
    } else if (tab === "tracking") {
      setActiveTab("tracking");
    }
  }, [searchParams]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id && !i.isCustomMeal);
      if (existing) {
        return prev.map((i) => (i.id === item.id && !i.isCustomMeal ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { 
        id: item.id, 
        name: item.name, 
        price: item.price, 
        time: item.time, 
        quantity: 1,
        instructions: { commonOptions: [], customNote: "" }
      }];
    });
    toast.success(`${item.name} added to cart`);
  };

  const addCustomMealToCart = (meal: {
    name: string;
    price: number;
    time: number;
    ingredients: Ingredient[];
    instructions: SpecialInstructions;
  }) => {
    const newId = customMealCounter;
    setCustomMealCounter((prev) => prev + 1);
    
    setCart((prev) => [
      ...prev,
      {
        id: newId,
        name: meal.name,
        price: meal.price,
        time: meal.time,
        quantity: 1,
        isCustomMeal: true,
        selectedIngredients: meal.ingredients,
        instructions: meal.instructions,
      },
    ]);
    toast.success("Custom meal added to cart!");
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const updateInstructions = (id: number, instructions: SpecialInstructions) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, instructions } : item))
    );
    toast.success("Instructions updated");
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsPlacingOrder(true);

    // Create the order
    const order = createOrder(cart, tableNumber, customerName, "dine_in");
    
    // Clear the cart
    setCart([]);
    
    // Switch to tracking tab
    setActiveTab("tracking");
    
    toast.success(`Order ${order.id} created!`, {
      description: "Complete payment to start preparation",
    });

    setIsPlacingOrder(false);
  };

  const handleMarkReady = (orderId: string) => {
    updateOrderStatus(orderId, "ready");
  };

  const handleMarkCompleted = (orderId: string) => {
    updateOrderStatus(orderId, "completed");
    toast.success("Order completed! Thank you for dining with us.");
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerName.firstName && customerName.lastName) {
      setShowNamePrompt(false);
      toast.success(`Welcome, ${customerName.firstName}!`);
    }
  };

  if (showNamePrompt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-serif">Welcome to XYZ Foods</CardTitle>
            <CardDescription>Please enter your name to continue</CardDescription>
            {tableNumber && (
              <Badge variant="secondary" className="mt-2">
                <MapPin className="w-3 h-3 mr-1" /> Table {tableNumber}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={customerName.firstName}
                  onChange={(e) => setCustomerName((prev) => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={customerName.lastName}
                  onChange={(e) => setCustomerName((prev) => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter your last name"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Continue to Menu
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="text-xl font-bold text-primary font-serif">
              XYZ Foods
            </Link>
            <div className="flex items-center gap-2">
              {tableNumber && (
                <Badge variant="secondary">
                  <MapPin className="w-3 h-3 mr-1" /> Table {tableNumber}
                </Badge>
              )}
              <Badge variant="outline">
                Hi, {customerName.firstName}!
              </Badge>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="reservation">Reservation</TabsTrigger>
              <TabsTrigger value="tracking" className="relative">
                Tracking
                {(getActiveOrders().length + getPendingPaymentOrders().length) > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {getActiveOrders().length + getPendingPaymentOrders().length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Menu Tab */}
          <TabsContent value="menu" className="mt-0">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Menu Items */}
              <div className="lg:col-span-2">
                <MenuItems 
                  onAddToCart={addToCart} 
                  onAddCustomMeal={addCustomMealToCart}
                />
              </div>

              {/* Cart Sidebar */}
              <div className="lg:col-span-1">
                <OrderCart
                  cart={cart}
                  tableNumber={tableNumber}
                  onUpdateQuantity={updateQuantity}
                  onUpdateInstructions={updateInstructions}
                  onPlaceOrder={handlePlaceOrder}
                  isPlacingOrder={isPlacingOrder}
                />
              </div>
            </div>
          </TabsContent>

          {/* Reservation Tab */}
          <TabsContent value="reservation" className="mt-0">
            <ReservationForm customerName={customerName} />
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="mt-0">
            <OrderTracking
              orders={orders}
              activeOrders={getActiveOrders()}
              pendingOrders={getPendingPaymentOrders()}
              orderHistory={getOrderHistory()}
              onSimulatePayment={simulatePayment}
              onMarkReady={handleMarkReady}
              onMarkCompleted={handleMarkCompleted}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Menu;