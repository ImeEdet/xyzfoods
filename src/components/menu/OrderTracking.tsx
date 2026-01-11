import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle2, 
  CreditCard, 
  ChefHat, 
  Bell,
  History,
  Package
} from "lucide-react";
import { Order } from "@/types/menu";
import { toast } from "sonner";

interface OrderTrackingProps {
  orders: Order[];
  activeOrders: Order[];
  pendingOrders: Order[];
  orderHistory: Order[];
  onSimulatePayment: (orderId: string) => void;
  onMarkReady: (orderId: string) => void;
  onMarkCompleted: (orderId: string) => void;
}

const statusConfig = {
  pending_payment: {
    label: "Awaiting Payment",
    color: "bg-yellow-500",
    icon: CreditCard,
    step: 1,
  },
  paid: {
    label: "Payment Received",
    color: "bg-blue-500",
    icon: CheckCircle2,
    step: 2,
  },
  preparing: {
    label: "Preparing",
    color: "bg-orange-500",
    icon: ChefHat,
    step: 3,
  },
  ready: {
    label: "Ready for Pickup",
    color: "bg-green-500",
    icon: Bell,
    step: 4,
  },
  completed: {
    label: "Completed",
    color: "bg-gray-500",
    icon: CheckCircle2,
    step: 5,
  },
};

const CountdownTimer = ({ targetTime, onComplete }: { targetTime: Date; onComplete?: () => void }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetTime.getTime();
      return Math.max(0, Math.floor((target - now) / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining === 0 && !hasCompleted) {
        setHasCompleted(true);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime, onComplete, hasCompleted]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (timeLeft === 0) {
    return (
      <span className="text-green-600 font-semibold flex items-center gap-1">
        <Bell className="w-4 h-4 animate-bounce" /> Ready!
      </span>
    );
  }

  return (
    <span className="font-mono text-lg">
      {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
    </span>
  );
};

const OrderCard = ({
  order,
  onSimulatePayment,
  onMarkReady,
  onMarkCompleted,
  showActions = true,
}: {
  order: Order;
  onSimulatePayment: (orderId: string) => void;
  onMarkReady: (orderId: string) => void;
  onMarkCompleted: (orderId: string) => void;
  showActions?: boolean;
}) => {
  const status = statusConfig[order.status];
  const StatusIcon = status.icon;
  const progressPercent = (status.step / 4) * 100;

  const handleTimerComplete = () => {
    if (order.status === "preparing") {
      onMarkReady(order.id);
      toast.success(`Order ${order.id} is ready!`, {
        description: "Your food is ready for pickup!",
        duration: 10000,
      });
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-serif">{order.id}</CardTitle>
            <CardDescription>
              {order.orderType === "pickup" ? "Pickup Order" : `Table ${order.tableNumber}`} • {order.items.length} items
            </CardDescription>
          </div>
          <Badge className={`${status.color} text-white`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        {order.status !== "completed" && (
          <div className="space-y-2">
            <Progress value={progressPercent} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Ordered</span>
              <span>Paid</span>
              <span>Preparing</span>
              <span>Ready</span>
            </div>
          </div>
        )}

        {/* Countdown timer for preparing orders */}
        {order.status === "preparing" && order.estimatedReadyAt && (
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Estimated ready in</p>
            <CountdownTimer 
              targetTime={order.estimatedReadyAt} 
              onComplete={handleTimerComplete}
            />
          </div>
        )}

        {/* Order items */}
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span className="text-muted-foreground">
                ₦{(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
          <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-primary">₦{order.total.toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <>
            {order.status === "pending_payment" && (
              <Button 
                className="w-full gap-2" 
                onClick={() => onSimulatePayment(order.id)}
              >
                <CreditCard className="w-4 h-4" />
                Pay Now (Mock Payment)
              </Button>
            )}
            {order.status === "ready" && (
              <Button 
                className="w-full gap-2"
                variant="secondary"
                onClick={() => onMarkCompleted(order.id)}
              >
                <Package className="w-4 h-4" />
                Mark as Collected
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export const OrderTracking = ({
  orders,
  activeOrders,
  pendingOrders,
  orderHistory,
  onSimulatePayment,
  onMarkReady,
  onMarkCompleted,
}: OrderTrackingProps) => {
  const [showHistory, setShowHistory] = useState(false);

  const allCurrentOrders = [...pendingOrders, ...activeOrders];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Toggle between active and history */}
      <div className="flex gap-2">
        <Button
          variant={showHistory ? "outline" : "default"}
          onClick={() => setShowHistory(false)}
          className="flex-1 gap-2"
        >
          <Clock className="w-4 h-4" />
          Active Orders ({allCurrentOrders.length})
        </Button>
        <Button
          variant={showHistory ? "default" : "outline"}
          onClick={() => setShowHistory(true)}
          className="flex-1 gap-2"
        >
          <History className="w-4 h-4" />
          Order History ({orderHistory.length})
        </Button>
      </div>

      {!showHistory ? (
        // Active Orders
        <>
          {allCurrentOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No active orders</p>
                  <p className="text-sm">Place an order from the menu to track it here</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {allCurrentOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onSimulatePayment={onSimulatePayment}
                  onMarkReady={onMarkReady}
                  onMarkCompleted={onMarkCompleted}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        // Order History
        <>
          {orderHistory.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No order history</p>
                  <p className="text-sm">Completed orders will appear here</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orderHistory.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onSimulatePayment={onSimulatePayment}
                  onMarkReady={onMarkReady}
                  onMarkCompleted={onMarkCompleted}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* SMS Notification placeholder */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="py-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Bell className="w-5 h-5" />
            <div>
              <p className="text-sm font-medium">SMS Notifications</p>
              <p className="text-xs">Coming soon - Get notified when your order is ready</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
