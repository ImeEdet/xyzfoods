import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  CreditCard,
  ChefHat,
  Bell,
  History,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";
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
  pending_payment: { label: "Awaiting Payment", icon: CreditCard, step: 1, tone: "bg-accent text-accent-foreground" },
  paid:            { label: "Payment Received", icon: CheckCircle2, step: 2, tone: "bg-secondary text-secondary-foreground" },
  preparing:       { label: "In the Kitchen",   icon: ChefHat,      step: 3, tone: "bg-primary text-primary-foreground" },
  ready:           { label: "Ready",            icon: Bell,         step: 4, tone: "bg-success text-success-foreground" },
  completed:       { label: "Completed",        icon: CheckCircle2, step: 5, tone: "bg-muted text-muted-foreground" },
} as const;

const STEPS: Array<{ key: keyof typeof statusConfig; label: string }> = [
  { key: "pending_payment", label: "Ordered" },
  { key: "paid", label: "Paid" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
];

const CountdownRing = ({
  targetTime,
  totalSeconds,
  onComplete,
}: { targetTime: Date; totalSeconds: number; onComplete?: () => void }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const calc = () => Math.max(0, Math.floor((targetTime.getTime() - Date.now()) / 1000));
    setTimeLeft(calc());
    const id = setInterval(() => {
      const r = calc();
      setTimeLeft(r);
      if (r === 0 && !done) {
        setDone(true);
        onComplete?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [targetTime, onComplete, done]);

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const pct = totalSeconds > 0 ? Math.min(100, ((totalSeconds - timeLeft) / totalSeconds) * 100) : 100;
  const r = 42;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {timeLeft === 0 ? (
          <Bell className="w-7 h-7 text-success animate-bounce" />
        ) : (
          <>
            <span className="font-mono text-xl font-semibold leading-none">
              {m.toString().padStart(2, "0")}:{s.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">left</span>
          </>
        )}
      </div>
    </div>
  );
};

const StatusTimeline = ({ currentStep }: { currentStep: number }) => (
  <div className="flex items-center gap-1">
    {STEPS.map((s, i) => {
      const reached = currentStep >= i + 1;
      return (
        <div key={s.key} className="flex-1 flex items-center gap-1">
          <div className="flex flex-col items-center gap-1.5 min-w-0">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors ${
                reached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-[10px] uppercase tracking-wider ${reached ? "text-foreground" : "text-muted-foreground"}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px ${reached && currentStep >= i + 2 ? "bg-primary" : "bg-border"}`} />
          )}
        </div>
      );
    })}
  </div>
);

const OrderCard = ({
  order,
  onSimulatePayment,
  onMarkReady,
  onMarkCompleted,
  showActions = true,
}: {
  order: Order;
  onSimulatePayment: (id: string) => void;
  onMarkReady: (id: string) => void;
  onMarkCompleted: (id: string) => void;
  showActions?: boolean;
}) => {
  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  const totalPrepSecs = order.maxPrepTime * 60;
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-sm shadow-soft overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Order</span>
            <h3 className="font-display text-2xl font-bold leading-tight">{order.id}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {order.orderType === "pickup" ? "Pickup" : `Table ${order.tableNumber}`} · {order.items.length} {order.items.length === 1 ? "item" : "items"}
            </p>
          </div>
          <Badge className={`${status.tone} rounded-full px-3 gap-1`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </Badge>
        </div>

        {order.status !== "completed" && (
          <div className="mb-5">
            <StatusTimeline currentStep={status.step} />
          </div>
        )}

        {order.status === "preparing" && order.estimatedReadyAt && (
          <div className="flex items-center gap-4 bg-muted/40 rounded-sm p-4 mb-4">
            <CountdownRing
              targetTime={order.estimatedReadyAt}
              totalSeconds={totalPrepSecs}
              onComplete={handleTimerComplete}
            />
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Cooking</p>
              <p className="font-display text-lg leading-tight mt-1">Your meal is on the fire</p>
              <p className="text-xs text-muted-foreground mt-1">We'll alert you when it's ready.</p>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-foreground">
                <span className="text-muted-foreground mr-1">{item.quantity}×</span>
                {item.name}
              </span>
              <span className="text-muted-foreground">
                ₦{(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
          <div className="border-t border-dashed border-border pt-2 mt-2 flex justify-between items-baseline">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-display text-xl font-bold text-primary">
              ₦{order.total.toLocaleString()}
            </span>
          </div>
        </div>

        {showActions && (
          <>
            {order.status === "pending_payment" && (
              <Button
                className="w-full mt-4 h-11 rounded-full gap-2 gradient-sun text-primary-foreground border-0 shadow-warm hover:opacity-95"
                onClick={() => onSimulatePayment(order.id)}
              >
                <CreditCard className="w-4 h-4" />
                Pay Now (Mock)
              </Button>
            )}
            {order.status === "ready" && (
              <Button
                className="w-full mt-4 h-11 rounded-full gap-2"
                variant="secondary"
                onClick={() => onMarkCompleted(order.id)}
              >
                <Package className="w-4 h-4" />
                Mark as Collected
              </Button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

const EmptyState = ({ icon: Icon, title, sub }: { icon: typeof ShoppingCart; title: string; sub: string }) => (
  <Card className="border-dashed">
    <CardContent className="py-14 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-muted-foreground/60" />
      </div>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{sub}</p>
    </CardContent>
  </Card>
);

export const OrderTracking = ({
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
      <div className="text-center mb-2">
        <span className="eyebrow"><span className="gold-rule" />Order Status</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Track your meal</h2>
      </div>

      <div className="inline-flex w-full bg-muted/50 rounded-full p-1">
        <button
          onClick={() => setShowHistory(false)}
          className={`flex-1 h-10 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            !showHistory ? "bg-card shadow-soft text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="w-4 h-4" /> Active ({allCurrentOrders.length})
        </button>
        <button
          onClick={() => setShowHistory(true)}
          className={`flex-1 h-10 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            showHistory ? "bg-card shadow-soft text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="w-4 h-4" /> History ({orderHistory.length})
        </button>
      </div>

      {!showHistory ? (
        allCurrentOrders.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="No active orders" sub="Place an order from the menu to track it here" />
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
        )
      ) : (
        orderHistory.length === 0 ? (
          <EmptyState icon={History} title="No order history" sub="Completed orders will appear here" />
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
        )
      )}

      <div className="flex items-center gap-3 text-muted-foreground bg-muted/30 border border-dashed border-border rounded-sm p-4">
        <Bell className="w-5 h-5" />
        <div>
          <p className="text-sm font-medium">SMS notifications</p>
          <p className="text-xs">Coming soon — get a ping the moment your meal is ready.</p>
        </div>
      </div>
    </div>
  );
};
