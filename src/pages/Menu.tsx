import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

import heroJollof from "@/assets/hero-jollof.jpg";
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

  const { items: menuItems, ingredients: dbIngredients, settings: appSettings } = useMenu();

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
      <div className="min-h-screen bg-background grid md:grid-cols-2">
        {/* Image side */}
        <div className="relative hidden md:block">
          <img
            src={heroJollof}
            alt="A warm Nigerian meal"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-foreground/80 via-foreground/30 to-transparent" />
          <div className="absolute inset-0 pattern-ankara opacity-25" />
          <div className="relative h-full flex flex-col justify-between p-10 text-background">
            <Link to="/" className="font-display text-2xl font-bold">
              XYZ <span className="text-accent">Foods</span>
            </Link>
            <div>
              <span className="text-[11px] uppercase tracking-[0.22em] text-accent">
                <span className="inline-block w-10 h-px bg-accent align-middle mr-3" />Welcome
              </span>
              <h2 className="font-display text-4xl lg:text-5xl font-semibold mt-3 leading-tight max-w-sm">
                A seat at our table is waiting.
              </h2>
            </div>
          </div>
        </div>

        {/* Form side */}
        <div className="flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            <Link to="/" className="md:hidden font-display text-xl font-bold text-primary">
              XYZ <span className="text-foreground">Foods</span>
            </Link>
            <span className="eyebrow mt-6 md:mt-0"><span className="gold-rule" />Hello, friend</span>
            <h1 className="font-display text-3xl md:text-4xl font-bold mt-3">
              Tell us your name
            </h1>
            <p className="text-muted-foreground mt-2">
              We'll make your visit feel personal.
            </p>
            {tableNumber && (
              <Badge variant="secondary" className="mt-4 rounded-full">
                <MapPin className="w-3 h-3 mr-1" /> Table {tableNumber}
              </Badge>
            )}

            <form onSubmit={handleNameSubmit} className="space-y-4 mt-8">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={customerName.firstName}
                  onChange={(e) => setCustomerName((prev) => ({ ...prev, firstName: e.target.value }))}
                  placeholder="e.g. Ada"
                  className="h-12 mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={customerName.lastName}
                  onChange={(e) => setCustomerName((prev) => ({ ...prev, lastName: e.target.value }))}
                  placeholder="e.g. Okafor"
                  className="h-12 mt-1"
                  required
                />
              </div>
              <Button type="submit" size="lg" className="w-full h-12 rounded-full gradient-sun text-primary-foreground border-0 shadow-warm hover:opacity-95">
                Continue to Menu
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4 gap-3">
            <Link to="/" className="font-display text-xl font-bold text-primary tracking-tight">
              XYZ <span className="text-foreground">Foods</span>
            </Link>
            <div className="flex items-center gap-2">
              {tableNumber && (
                <Badge variant="secondary" className="rounded-full px-3">
                  <MapPin className="w-3 h-3 mr-1" /> Table {tableNumber}
                </Badge>
              )}
              <Badge variant="outline" className="rounded-full px-3 hidden sm:inline-flex">
                Hi, {customerName.firstName}
              </Badge>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-transparent p-0 h-auto border-b border-border rounded-none">
              {[
                { v: "menu", label: "Menu" },
                { v: "reservation", label: "Reservation" },
                { v: "tracking", label: "Tracking" },
              ].map((t) => {
                const count = t.v === "tracking" ? getActiveOrders().length + getPendingPaymentOrders().length : 0;
                return (
                  <TabsTrigger
                    key={t.v}
                    value={t.v}
                    className="relative bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent text-muted-foreground hover:text-foreground transition-colors py-3 font-medium"
                  >
                    {t.label}
                    {count > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1 bg-primary text-primary-foreground text-[10px] rounded-full">
                        {count}
                      </span>
                    )}
                  </TabsTrigger>
                );
              })}
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
                  items={menuItems}
                  ingredients={dbIngredients}
                  settings={appSettings}
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