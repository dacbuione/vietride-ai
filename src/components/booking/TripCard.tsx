import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Bus, Clock, Star, Users, Tag } from "lucide-react";
import { motion } from "framer-motion";
import type { Trip } from "@/lib/mockData";
interface TripCardProps {
  trip: Trip;
}
export function TripCard({ trip }: TripCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="cursor-pointer h-full"
    >
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl border-transparent hover:border-blue-500/50 flex flex-col h-full">
        <CardHeader className="p-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center">
                <Bus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{trip.operator}</h3>
                <p className="text-sm text-muted-foreground">{trip.vehicleType}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-semibold text-sm">{trip.rating}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4 flex-grow">
          <div className="flex items-center justify-between text-center">
            <div>
              <p className="text-xl font-bold">{trip.departureTime}</p>
              <p className="text-sm text-muted-foreground">{trip.from}</p>
            </div>
            <div className="flex-1 px-2 text-center">
              <div className="flex items-center justify-center text-muted-foreground">
                <Clock className="w-3 h-3 mr-1" />
                <span className="text-xs">{trip.duration}</span>
              </div>
              <div className="w-full h-px bg-border my-1"></div>
              <ArrowRight className="w-4 h-4 text-muted-foreground mx-auto" />
            </div>
            <div>
              <p className="text-xl font-bold">{trip.arrivalTime}</p>
              <p className="text-sm text-muted-foreground">{trip.to}</p>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-orange-500" />
              <span className="font-bold text-lg text-orange-500">{formatCurrency(trip.price)}</span>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {trip.availableSeats} seats left
            </Badge>
          </div>
        </CardContent>
        <CardFooter className="p-4 bg-muted/20 mt-auto">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all duration-200 hover:shadow-lg">
            Book Now
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}