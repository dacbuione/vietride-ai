import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon, MapPin, Search, Users } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
export function SearchForm() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="w-full max-w-4xl mx-auto shadow-2xl bg-card/80 backdrop-blur-sm border-white/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center">
                <MapPin className="w-4 h-4 mr-2" /> Origin
              </label>
              <Input placeholder="e.g. Hanoi" className="bg-background/70" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center">
                <MapPin className="w-4 h-4 mr-2" /> Destination
              </label>
              <Input placeholder="e.g. Sapa" className="bg-background/70" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" /> Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background/70",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button size="lg" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg h-12 transition-all duration-200 hover:shadow-lg">
              <Search className="w-5 h-5 mr-2" /> Find Tickets
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}