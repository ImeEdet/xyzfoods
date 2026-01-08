import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Plus, Minus, ShoppingCart, UtensilsCrossed, MapPin } from "lucide-react";
import { toast } from "sonner";

// Mock menu data
const menuData = {
  starters: [
    { id: 1, name: "Pepper Soup", description: "Spicy Nigerian broth with assorted meat", price: 3500, time: 15, category: "Nigerian" },
    { id: 2, name: "Spring Rolls", description: "Crispy vegetable rolls with sweet chili sauce", price: 2000, time: 10, category: "Continental" },
    { id: 3, name: "Suya Skewers", description: "Grilled beef with special suya spice", price: 2500, time: 12, category: "Nigerian" },
    { id: 4, name: "Garlic Bread", description: "Toasted bread with garlic butter and herbs", price: 1500, time: 8, category: "Continental" },
  ],
  mains: [
    { id: 5, name: "Jollof Rice with Chicken", description: "Classic Nigerian jollof with grilled chicken", price: 5500, time: 25, category: "Nigerian" },
    { id: 6, name: "Pounded Yam & Egusi", description: "Smooth pounded yam with melon seed soup", price: 6000, time: 30, category: "Nigerian" },
    { id: 7, name: "Fried Rice & Plantain", description: "Nigerian-style fried rice with fried plantains", price: 5000, time: 20, category: "Nigerian" },
    { id: 8, name: "Spaghetti Bolognese", description: "Italian pasta with rich meat sauce", price: 4500, time: 18, category: "Italian" },
    { id: 9, name: "Grilled Salmon", description: "Fresh salmon with lemon butter sauce", price: 8500, time: 22, category: "Continental" },
    { id: 10, name: "Chicken Alfredo Pasta", description: "Creamy pasta with grilled chicken strips", price: 5500, time: 20, category: "Italian" },
  ],
  sides: [
    { id: 11, name: "Fried Plantains", description: "Sweet ripe plantains, perfectly fried", price: 1500, time: 8, category: "Nigerian" },
    { id: 12, name: "Coleslaw", description: "Fresh cabbage salad with creamy dressing", price: 1000, time: 5, category: "Continental" },
    { id: 13, name: "Moi Moi", description: "Steamed bean pudding with eggs", price: 1500, time: 15, category: "Nigerian" },
    { id: 14, name: "French Fries", description: "Crispy golden potato fries", price: 1200, time: 10, category: "Continental" },
  ],
  drinks: [
    { id: 15, name: "Chapman", description: "Classic Nigerian cocktail (non-alcoholic)", price: 2000, time: 5, category: "Nigerian" },
    { id: 16, name: "Fresh Fruit Smoothie", description: "Blend of seasonal fruits", price: 1800, time: 5, category: "Continental" },
    { id: 17, name: "Zobo", description: "Hibiscus drink with ginger and pineapple", price: 1000, time: 3, category: "Nigerian" },
    { id: 18, name: "Fresh Orange Juice", description: "Freshly squeezed oranges", price: 1500, time: 5, category: "Continental" },
  ],
  desserts: [
    { id: 19, name: "Puff Puff", description: "Nigerian fried dough balls with chocolate sauce", price: 1500, time: 10, category: "Nigerian" },
    { id: 20, name: "Ice Cream Sundae", description: "Vanilla ice cream with toppings", price: 2000, time: 5, category: "Continental" },
    { id: 21, name: "Chin Chin", description: "Crunchy fried pastry snacks", price: 1200, time: 5, category: "Nigerian" },
    { id: 22, name: "Chocolate Brownie", description: "Warm brownie with ice cream", price: 2500, time: 8, category: "Continental" },
  ],
};

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  time: number;
}

const Menu = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("menu");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState({ firstName: "", lastName: "" });
  const [showNamePrompt, setShowNamePrompt] = useState(true);

  // Auto-detect table number from URL (simulated for QR codes)
  useEffect(() => {
    const table = searchParams.get("table");
    if (table) {
      setTableNumber(parseInt(table));
    } else {
      // Simulate auto-detection for demo - random table 1-20
      setTableNumber(Math.floor(Math.random() * 20) + 1);
    }

    const tab = searchParams.get("tab");
    if (tab === "reservation") {
      setActiveTab("reservation");
    } else if (tab === "tracking") {
      setActiveTab("tracking");
    }
  }, [searchParams]);

  const addToCart = (item: { id: number; name: string; price: number; time: number }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const maxPrepTime = cart.length > 0 ? Math.max(...cart.map((item) => item.time)) : 0;

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
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
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
              <div className="lg:col-span-2 space-y-8">
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
                                onClick={() => addToCart(item)}
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

              {/* Cart Sidebar */}
              <div className="lg:col-span-1">
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
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-6 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, 1)}
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

                        <Button className="w-full mt-4" size="lg">
                          Place Order
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          Payment will be collected at your table
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Reservation Tab */}
          <TabsContent value="reservation" className="mt-0">
            <div className="max-w-xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Make a Reservation</CardTitle>
                  <CardDescription>Book a table or place a bulk order for pickup</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="resFirstName">First Name</Label>
                        <Input id="resFirstName" defaultValue={customerName.firstName} />
                      </div>
                      <div>
                        <Label htmlFor="resLastName">Last Name</Label>
                        <Input id="resLastName" defaultValue={customerName.lastName} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="+234 801 234 5678" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="date" />
                      </div>
                      <div>
                        <Label htmlFor="time">Time</Label>
                        <Input id="time" type="time" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="guests">Number of Guests</Label>
                      <Input id="guests" type="number" min="1" max="20" placeholder="2" />
                    </div>
                    <div>
                      <Label htmlFor="notes">Special Requests</Label>
                      <Textarea id="notes" placeholder="Any dietary requirements or special occasions?" />
                    </div>
                    <Button type="submit" className="w-full" size="lg">
                      Confirm Reservation
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="mt-0">
            <div className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Order Tracking</CardTitle>
                  <CardDescription>Track the status of your orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No active orders</p>
                    <p className="text-sm">Place an order from the menu to track it here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Menu;
