import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Package, Users, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Reservation } from "@/types/menu";

import dineinImg from "@/assets/reservation-dinein.jpg";
import pickupImg from "@/assets/reservation-pickup.jpg";

interface ReservationFormProps {
  customerName: { firstName: string; lastName: string };
  onReservationCreated?: (reservation: Reservation) => void;
}

export const ReservationForm = ({ customerName, onReservationCreated }: ReservationFormProps) => {
  const [mode, setMode] = useState<"dine_in" | "pickup">("dine_in");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastReservation, setLastReservation] = useState<Reservation | null>(null);

  const [formData, setFormData] = useState({
    firstName: customerName.firstName,
    lastName: customerName.lastName,
    phone: "",
    date: "",
    time: "",
    guests: "",
    notes: "",
    pickupTime: "",
    orderDetails: "",
  });

  const handleChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const validateForm = (): boolean => {
    if (!formData.firstName || !formData.lastName) return toast.error("Please enter your name"), false;
    if (!formData.phone) return toast.error("Please enter your phone number"), false;
    if (mode === "dine_in") {
      if (!formData.date || !formData.time) return toast.error("Please select a date and time"), false;
      if (!formData.guests || parseInt(formData.guests) < 1) return toast.error("Please enter number of guests"), false;
    } else {
      if (!formData.pickupTime) return toast.error("Please select a pickup time"), false;
      if (!formData.orderDetails) return toast.error("Please describe your order"), false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));

    const reservation: Reservation = {
      id: `RES-${Date.now().toString(36).toUpperCase()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      date: mode === "dine_in" ? formData.date : formData.pickupTime.split("T")[0] || "",
      time: mode === "dine_in" ? formData.time : formData.pickupTime.split("T")[1] || "",
      guests: parseInt(formData.guests) || 0,
      notes: mode === "dine_in" ? formData.notes : formData.orderDetails,
      status: "pending",
      createdAt: new Date(),
    };

    setLastReservation(reservation);
    setShowSuccess(true);
    setIsSubmitting(false);
    toast.success(mode === "dine_in" ? "Reservation confirmed!" : "Bulk order request submitted!");
    onReservationCreated?.(reservation);
  };

  const resetForm = () => {
    setShowSuccess(false);
    setLastReservation(null);
    setFormData({
      firstName: customerName.firstName,
      lastName: customerName.lastName,
      phone: "",
      date: "",
      time: "",
      guests: "",
      notes: "",
      pickupTime: "",
      orderDetails: "",
    });
  };

  if (showSuccess && lastReservation) {
    return (
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-sm shadow-card p-10 text-center"
        >
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <span className="eyebrow"><span className="gold-rule" />Confirmed</span>
          <h2 className="font-display text-3xl font-bold mt-2">
            {mode === "dine_in" ? "Your table is reserved" : "Order request received"}
          </h2>
          <p className="text-muted-foreground mt-2">
            {mode === "dine_in" ? "We can't wait to host you." : "We'll call to confirm details."}
          </p>

          <div className="bg-muted/40 rounded-sm p-5 text-left space-y-2 max-w-sm mx-auto mt-6 text-sm">
            <p><span className="text-muted-foreground">Reference:</span> <strong>{lastReservation.id}</strong></p>
            <p><span className="text-muted-foreground">Name:</span> {lastReservation.firstName} {lastReservation.lastName}</p>
            <p><span className="text-muted-foreground">Date:</span> {lastReservation.date}</p>
            <p><span className="text-muted-foreground">Time:</span> {lastReservation.time}</p>
            {mode === "dine_in" && lastReservation.guests > 0 && (
              <p><span className="text-muted-foreground">Guests:</span> {lastReservation.guests}</p>
            )}
          </div>

          <Button onClick={resetForm} variant="outline" className="rounded-full mt-6">
            Make another reservation
          </Button>
        </motion.div>
      </div>
    );
  }

  const heroImg = mode === "dine_in" ? dineinImg : pickupImg;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <span className="eyebrow"><span className="gold-rule" />Reserve</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Save your spot</h2>
        <p className="text-muted-foreground mt-2">Book a table or place a bulk order for pickup.</p>
      </div>

      {/* Segmented mode picker with imagery */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { v: "dine_in", label: "Dine In", icon: Users, sub: "Book a table" },
          { v: "pickup", label: "Bulk Pickup", icon: Package, sub: "Catering & events" },
        ].map((opt) => {
          const Icon = opt.icon;
          const active = mode === opt.v;
          return (
            <button
              key={opt.v}
              type="button"
              onClick={() => setMode(opt.v as typeof mode)}
              className={`relative overflow-hidden rounded-sm border text-left p-4 transition-all ${
                active
                  ? "border-primary shadow-warm"
                  : "border-border hover:border-foreground/30"
              }`}
            >
              <div className="absolute inset-0 -z-0 opacity-15">
                <img
                  src={opt.v === "dine_in" ? dineinImg : pickupImg}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="relative flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active ? "gradient-sun text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-display font-semibold">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.sub}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-sm shadow-card overflow-hidden">
        <div className="relative h-32 md:h-40">
          <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <span className="eyebrow">Your details</span>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" className="h-11 mt-1" value={formData.firstName} onChange={(e) => handleChange("firstName", e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" className="h-11 mt-1" value={formData.lastName} onChange={(e) => handleChange("lastName", e.target.value)} required />
              </div>
            </div>
            <div className="mt-3">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" className="h-11 mt-1" placeholder="+234 801 234 5678" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} required />
            </div>
          </div>

          <div className="border-t border-dashed border-border pt-5">
            <span className="eyebrow">{mode === "dine_in" ? "Booking details" : "Pickup details"}</span>
            {mode === "dine_in" ? (
              <div className="space-y-3 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" className="h-11 mt-1" value={formData.date} onChange={(e) => handleChange("date", e.target.value)} min={new Date().toISOString().split("T")[0]} required />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" className="h-11 mt-1" value={formData.time} onChange={(e) => handleChange("time", e.target.value)} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Input id="guests" type="number" min="1" max="50" className="h-11 mt-1" placeholder="2" value={formData.guests} onChange={(e) => handleChange("guests", e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="notes">Special Requests</Label>
                  <Textarea id="notes" className="mt-1" placeholder="Any dietary needs or special occasion?" value={formData.notes} onChange={(e) => handleChange("notes", e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="space-y-3 mt-2">
                <div>
                  <Label htmlFor="pickupTime">Pickup Date & Time</Label>
                  <Input id="pickupTime" type="datetime-local" className="h-11 mt-1" value={formData.pickupTime} onChange={(e) => handleChange("pickupTime", e.target.value)} min={new Date().toISOString().slice(0, 16)} required />
                </div>
                <div>
                  <Label htmlFor="orderDetails">Order Details</Label>
                  <Textarea id="orderDetails" className="mt-1" rows={4} placeholder="e.g. 50 plates of Jollof Rice, 30 plates of Fried Rice…" value={formData.orderDetails} onChange={(e) => handleChange("orderDetails", e.target.value)} required />
                  <p className="text-xs text-muted-foreground mt-1">We'll contact you to confirm quantities and pricing.</p>
                </div>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full h-12 rounded-full gap-2 gradient-sun text-primary-foreground border-0 shadow-warm hover:opacity-95" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : mode === "dine_in" ? (<><Calendar className="w-4 h-4" /> Confirm Reservation</>) : (<><Package className="w-4 h-4" /> Submit Bulk Order</>)}
          </Button>
        </form>
      </div>
    </div>
  );
};
