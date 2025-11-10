import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchForm } from '@/components/booking/SearchForm';
import { TripCard } from '@/components/booking/TripCard';
import { AIAssistant } from '@/components/chat/AIAssistant';
import { BookingModal } from '@/components/booking/BookingModal';
import { Header } from '@/components/layout/Header';
import { Toaster, toast } from 'sonner';
import type { Trip } from '@/lib/mockData';
import { format } from 'date-fns';
export function HomePage() {
  const [isChatOpen, setChatOpen] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  useEffect(() => {
    const handleToolResults = (event: any) => {
      const { detail } = event;
      if (detail.toolName === 'search_routes' && detail.result) {
        setIsLoading(false);
        if (Array.isArray(detail.result) && detail.result.length > 0) {
          setTrips(detail.result);
          toast.success(`Found ${detail.result.length} trips for you!`);
        } else {
          setTrips([]);
          toast.info("Sorry, I couldn't find any trips for that route.");
        }
      }
    };
    window.addEventListener('tool-result', handleToolResults);
    return () => window.removeEventListener('tool-result', handleToolResults);
  }, []);
  const handleNewMessageFromAI = (message: string) => {
    if (message.toLowerCase().includes('find') || message.toLowerCase().includes('search') || message.toLowerCase().includes('bus')) {
      setIsLoading(true);
      setTrips([]);
    }
  };
  const handleSearch = async (params: { origin: string; destination: string; date?: Date }) => {
    setIsLoading(true);
    setTrips([]);
    try {
      const query = new URLSearchParams({
        origin: params.origin,
        destination: params.destination,
        date: params.date ? format(params.date, 'yyyy-MM-dd') : '',
      });
      const response = await fetch(`/api/trips/search?${query.toString()}`);
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        if (result.data.length > 0) {
          setTrips(result.data);
          toast.success(`Found ${result.data.length} trips!`);
        } else {
          toast.info("No trips found for the selected route. Try another search!");
        }
      } else {
        toast.error(result.error || "An error occurred while searching.");
      }
    } catch (error) {
      toast.error("Failed to connect to the server. Please try again.");
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleBookNow = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsBookingModalOpen(true);
  };
  return (
    <>
      <div className="min-h-screen w-full bg-background font-sans antialiased relative">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-neutral-950 dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)]">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f622,transparent)]"></div>
        </div>
        <Header />
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-24 md:py-32 lg:py-40 text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-foreground mb-6 font-['Sora']"
              >
                Travel Vietnam, <span className="text-blue-600">Smarter</span>.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10"
              >
                Instantly book car and bus tickets across Vietnam with our classic search or powerful AI assistant.
              </motion.p>
              <SearchForm onSearch={handleSearch} isLoading={isLoading} />
            </div>
            <div className="py-12 md:py-16">
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-center items-center flex-col text-center"
                  >
                    <div className="loader"></div>
                    <p className="text-muted-foreground mt-4">Searching for the best routes...</p>
                    <style>{`.loader{width:50px;aspect-ratio:1;border-radius:50%;border:8px solid #514b82;animation:l20-1 0.8s infinite linear alternate,l20-2 1.6s infinite linear}.@keyframes l20-1{0%{clip-path:polygon(50% 50%,0 0,50% 0,50% 0,50% 0,50% 0)}12.5%{clip-path:polygon(50% 50%,0 0,50% 0,100% 0,100% 0,100% 0)}25%{clip-path:polygon(50% 50%,0 0,50% 0,100% 0,100% 100%,100% 100%)}37.5%{clip-path:polygon(50% 50%,0 0,50% 0,100% 0,100% 100%,0 100%)}50%{clip-path:polygon(50% 50%,0 0,50% 0,100% 0,100% 100%,0 100%)}62.5%{clip-path:polygon(50% 50%,50% 50%,50% 0,100% 0,100% 100%,0 100%)}75%{clip-path:polygon(50% 50%,50% 50%,50% 50%,100% 0,100% 100%,0 100%)}87.5%{clip-path:polygon(50% 50%,50% 50%,50% 50%,50% 50%,100% 100%,0 100%)}100%{clip-path:polygon(50% 50%,50% 50%,50% 50%,50% 50%,50% 50%,0 100%)}}@keyframes l20-2{0%{transform:scaleY(1) rotate(0deg)}49.99%{transform:scaleY(1) rotate(135deg)}50%{transform:scaleY(-1) rotate(-135deg)}100%{transform:scaleY(-1) rotate(-360deg)}}`}</style>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {trips.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h2 className="text-3xl font-bold tracking-tight text-center mb-8">Available Trips</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {trips.map((trip, i) => (
                        <motion.div
                          key={trip.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.1 }}
                          onClick={() => handleBookNow(trip)}
                        >
                          <TripCard trip={trip} />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
        <footer className="py-8 border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
            <p>&copy; {new Date().getFullYear()} VietRide AI. All rights reserved.</p>
            <p className="mt-1">Built with ❤️ at Cloudflare.</p>
            <p className="mt-2 text-xs">Note: AI interactions are subject to usage limits.</p>
          </div>
        </footer>
      </div>
      <AIAssistant isOpen={isChatOpen} onClose={() => setChatOpen(false)} onNewMessage={handleNewMessageFromAI} />
      <BookingModal trip={selectedTrip} isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          size="lg"
          className="rounded-full h-16 w-16 shadow-2xl bg-blue-600 hover:bg-blue-700"
          onClick={() => setChatOpen(true)}
        >
          <MessageSquare className="w-8 h-8" />
        </Button>
      </motion.div>
      <Toaster richColors />
    </>
  );
}