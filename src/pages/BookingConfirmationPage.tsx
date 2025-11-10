import { useLocation, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/layout/Header";
import { ArrowLeft, BusFront, Calendar, Clock, Download, MapPin, Printer, User } from "lucide-react";
import type { Trip } from "@/lib/mockData";
export function BookingConfirmationPage() {
  const { bookingId } = useParams();
  const location = useLocation();
  const { trip } = (location.state as { trip: Trip }) || {};
  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-4">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold mb-4">Booking Not Found</h1>
          <p className="text-muted-foreground mb-8">We couldn't find the details for this booking. It might have expired.</p>
          <Button asChild>
            <Link to="/"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  return (
    <div className="min-h-screen bg-muted/40">
      <Header />
      <div className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-extrabold tracking-tight font-['Sora']">Booking Confirmed!</h1>
            <p className="text-lg text-muted-foreground mt-2">Your trip to {trip.to} is all set. Here are your details.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="w-full shadow-lg">
              <CardHeader className="bg-muted/50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Your E-Ticket</CardTitle>
                    <CardDescription>Booking ID: {bookingId}</CardDescription>
                  </div>
                  <div className="p-3 bg-white rounded-lg border">
                    <svg width="80" height="80" viewBox="0 0 100 100">
                      <path d="M10 10 H90 V90 H10Z M20 20 H80 V80 H20Z M30 30 H70 V70 H30Z M40 40 H60 V60 H40Z M15 15 H35 V35 H15Z M65 15 H85 V35 H65Z M15 65 H35 V85 H15Z M45 45 H55 V55 H45Z M65 65 H85 V85 H65Z" fill="#111" />
                    </svg>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Trip Details</h3>
                    <div className="flex items-start gap-3">
                      <BusFront className="w-5 h-5 mt-1 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{trip.operator}</p>
                        <p className="text-sm text-muted-foreground">{trip.vehicleType}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 mt-1 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{trip.from} to {trip.to}</p>
                        <p className="text-sm text-muted-foreground">Route</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Schedule</h3>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 mt-1 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p className="text-sm text-muted-foreground">Date</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 mt-1 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{trip.departureTime} - {trip.arrivalTime}</p>
                        <p className="text-sm text-muted-foreground">({trip.duration})</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Passenger & Payment</h3>
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 mt-1 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Alex Doe (1 Adult)</p>
                      <p className="text-sm text-muted-foreground">Passenger</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-muted-foreground">Total Amount Paid</p>
                    <p className="font-bold text-xl text-orange-500">{formatCurrency(trip.price)}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="w-full"><Printer className="w-4 h-4 mr-2" /> Print Ticket</Button>
                  <Button variant="outline" className="w-full"><Download className="w-4 h-4 mr-2" /> Download PDF</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <div className="mt-8 text-center">
            <Button asChild variant="ghost">
              <Link to="/"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}