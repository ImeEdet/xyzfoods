export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  time: number;
  category: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  time: number;
}

export type OrderStatus = "pending_payment" | "paid" | "preparing" | "ready" | "completed";

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  maxPrepTime: number;
  status: OrderStatus;
  createdAt: Date;
  estimatedReadyAt: Date | null;
  tableNumber: number | null;
  customerName: { firstName: string; lastName: string };
  orderType: "dine_in" | "pickup";
}

export interface Reservation {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  notes: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: Date;
}

// Menu data
export const menuData: Record<string, MenuItem[]> = {
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
