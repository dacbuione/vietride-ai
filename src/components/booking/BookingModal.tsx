import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Bus, Check, CreditCard, Loader2, User, Users } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import type { Trip } from "@/lib/mockData";
interface BookingModalProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
}
const steps = [
  { id: 1, name: "Seat Selection", icon: Users },
  { id: 2, name: "Passenger Details", icon: User },
  { id: 3, name: "Payment", icon: CreditCard },
  { id: 4, name: "Confirmation", icon: Check },
];
export function BookingModal({ trip, isOpen, onClose }: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };
  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    const bookingId = `VR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    if (token && trip) {
      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ trip }),
        });
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to save booking.');
        }
        toast.success("Your booking has been saved to your account!");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'An unknown error occurred.');
        setIsProcessing(false);
        return;
      }
    }
    // Simulate processing time for visual feedback
    setTimeout(() => {
      setIsProcessing(false);
      navigate(`/booking/${bookingId}/confirmation`, { state: { trip } });
      onClose();
      setCurrentStep(1);
    }, 500);
  };
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;
  if (!trip) return null;
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        // Reset step on close
        setTimeout(() => setCurrentStep(1), 300);
      }
    }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <Bus className="w-6 h-6 text-blue-600" /> Book Your Trip
          </DialogTitle>
          <DialogDescription>
            You're booking a trip from {trip.from} to {trip.to} with {trip.operator}.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4">
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center text-center w-1/4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                    currentStep >= step.id ? "bg-blue-600 border-blue-600 text-white" : "bg-muted border-border"
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                <p className={`text-xs mt-1 transition-colors duration-300 ${currentStep >= step.id ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                  {step.name}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="min-h-[200px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {currentStep === 1 && (
                <div className="text-center space-y-4 p-8 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold">Seat Selection</h3>
                  <p className="text-muted-foreground">This feature is coming soon! For now, we'll assign you the best available seats.</p>
                </div>
              )}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-center mb-4">Passenger Details</h3>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="e.g. Alex Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="e.g. +84 123 456 789" />
                  </div>
                </div>
              )}
              {currentStep === 3 && (
                <div className="text-center space-y-4 p-8 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold">Payment Information</h3>
                  <p className="text-muted-foreground">Payment processing is simulated. No real payment will be made.</p>
                </div>
              )}
              {currentStep === 4 && (
                <div className="text-center space-y-4">
                  <h3 className="font-semibold">Confirm Your Booking</h3>
                  <p className="text-muted-foreground">Please review your trip details below and confirm to complete your booking.</p>
                  <div className="text-left p-4 border rounded-lg bg-muted/50">
                    <p><strong>Operator:</strong> {trip.operator}</p>
                    <p><strong>Route:</strong> {trip.from} <ArrowRight className="inline w-4 h-4" /> {trip.to}</p>
                    <p><strong>Time:</strong> {trip.departureTime} - {trip.arrivalTime}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <DialogFooter>
          {currentStep < steps.length ? (
            <Button onClick={handleNext} className="w-full bg-blue-600 hover:bg-blue-700">
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleConfirmBooking} disabled={isProcessing} className="w-full bg-orange-500 hover:bg-orange-600">
              {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              {isProcessing ? "Processing..." : "Confirm & Book"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}