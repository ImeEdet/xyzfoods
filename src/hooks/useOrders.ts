import { useState, useEffect } from "react";
import { Order, CartItem } from "@/types/menu";

const ORDERS_STORAGE_KEY = "xyz_orders";

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  // Load orders from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const ordersWithDates = parsed.map((order: Order) => ({
          ...order,
          createdAt: new Date(order.createdAt),
          estimatedReadyAt: order.estimatedReadyAt ? new Date(order.estimatedReadyAt) : null,
        }));
        setOrders(ordersWithDates);
      } catch (e) {
        console.error("Failed to parse orders from localStorage", e);
      }
    }
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const createOrder = (
    items: CartItem[],
    tableNumber: number | null,
    customerName: { firstName: string; lastName: string },
    orderType: "dine_in" | "pickup" = "dine_in"
  ): Order => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const maxPrepTime = Math.max(...items.map((item) => item.time));
    
    const now = new Date();
    const estimatedReadyAt = new Date(now.getTime() + maxPrepTime * 60 * 1000);

    const newOrder: Order = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      items,
      total,
      maxPrepTime,
      status: "pending_payment",
      createdAt: now,
      estimatedReadyAt,
      tableNumber,
      customerName,
      orderType,
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          // If moving to "preparing", set the estimated ready time
          if (status === "preparing") {
            const now = new Date();
            return {
              ...order,
              status,
              estimatedReadyAt: new Date(now.getTime() + order.maxPrepTime * 60 * 1000),
            };
          }
          return { ...order, status };
        }
        return order;
      })
    );
  };

  const getActiveOrders = () => {
    return orders.filter((order) => 
      order.status !== "completed" && order.status !== "pending_payment"
    );
  };

  const getPendingPaymentOrders = () => {
    return orders.filter((order) => order.status === "pending_payment");
  };

  const getOrderHistory = () => {
    return orders.filter((order) => order.status === "completed");
  };

  const simulatePayment = (orderId: string) => {
    // Mock payment - in real app this would go to Paystack
    updateOrderStatus(orderId, "paid");
    
    // Simulate kitchen accepting order after 2 seconds
    setTimeout(() => {
      updateOrderStatus(orderId, "preparing");
    }, 2000);
  };

  return {
    orders,
    createOrder,
    updateOrderStatus,
    getActiveOrders,
    getPendingPaymentOrders,
    getOrderHistory,
    simulatePayment,
  };
};
