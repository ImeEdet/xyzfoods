import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Package, Users, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Reservation } from "@/types/menu";

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
    // Pickup specific
    pickupTime: "",
    orderDetails: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName || !formData.lastName) {
      toast.error("Please enter your name");
      return false;
    }
    if (!formData.phone) {
      toast.error("Please enter your phone number");
      return false;
    }
    
    if (mode === "dine_in") {
      if (!formData.date || !formData.time) {
        toast.error("Please select a date and time");
        return false;
      }
      if (!formData.guests || parseInt(formData.guests) < 1) {
        toast.error("Please enter number of guests");
        return false;
      }
    } else {
      if (!formData.pickupTime) {
        toast.error("Please select a pickup time");
        return false;
      }
      if (!formData.orderDetails) {
        toast.error("Please describe your order");
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
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
    
    toast.success(
      mode === "dine_in" 
        ? "Reservation confirmed!" 
        : "Bulk order request submitted!"
    );
    
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
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold font-serif">
                {mode === "dine_in" ? "Reservation Confirmed!" : "Order Request Submitted!"}
              </h2>
              <p className="text-muted-foreground">
                {mode === "dine_in" 
                  ? "We look forward to seeing you!"
                  : "We'll call you to confirm your order details."
                }
              </p>
              
              <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2 max-w-sm mx-auto">
                <p className="text-sm">
                  <strong>Reference:</strong> {lastReservation.id}
                </p>
                <p className="text-sm">
                  <strong>Name:</strong> {lastReservation.firstName} {lastReservation.lastName}
                </p>
                <p className="text-sm">
                  <strong>Date:</strong> {lastReservation.date}
                </p>
                <p className="text-sm">
                  <strong>Time:</strong> {lastReservation.time}
                </p>
                {mode === "dine_in" && lastReservation.guests > 0 && (
                  <p className="text-sm">
                    <strong>Guests:</strong> {lastReservation.guests}
                  </p>
                )}
              </div>
              
              <Button onClick={resetForm} variant="outline">
                Make Another Reservation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Make a Reservation</CardTitle>
          <CardDescription>Book a table or place a bulk order for pickup</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => setMode(v as "dine_in" | "pickup")} className="mb-6">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="dine_in" className="gap-2">
                <Users className="w-4 h-4" />
                Dine In
              </TabsTrigger>
              <TabsTrigger value="pickup" className="gap-2">
                <Package className="w-4 h-4" />
                Bulk Pickup
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="+234 801 234 5678"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                required
              />
            </div>

            {mode === "dine_in" ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input 
                      id="date" 
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleChange("date", e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input 
                      id="time" 
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleChange("time", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Input 
                    id="guests" 
                    type="number" 
                    min="1" 
                    max="50" 
                    placeholder="2"
                    value={formData.guests}
                    onChange={(e) => handleChange("guests", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Special Requests</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Any dietary requirements or special occasions?"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="pickupTime">Preferred Pickup Date & Time</Label>
                  <Input 
                    id="pickupTime" 
                    type="datetime-local"
                    value={formData.pickupTime}
                    onChange={(e) => handleChange("pickupTime", e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="orderDetails">Order Details</Label>
                  <Textarea 
                    id="orderDetails" 
                    placeholder="Describe your bulk order (e.g., 50 plates of Jollof Rice, 30 plates of Fried Rice...)"
                    rows={4}
                    value={formData.orderDetails}
                    onChange={(e) => handleChange("orderDetails", e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll contact you to confirm quantities and pricing
                  </p>
                </div>
              </>
            )}

            <Button type="submit" className="w-full gap-2" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>Processing...</>
              ) : mode === "dine_in" ? (
                <>
                  <Calendar className="w-4 h-4" />
                  Confirm Reservation
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  Submit Bulk Order Request
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
