import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bus, Calendar, Clock, MapPin, PlusCircle } from 'lucide-react';
import type { Booking } from '../../worker/types';
import { format } from 'date-fns';
export function DashboardPage() {
  const { user, token } = useAuthStore((state) => ({ user: state.user, token: state.token }));
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/bookings', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const result = await response.json();
        if (result.success) {
          setBookings(result.data);
        } else {
          toast.error(result.error || 'Failed to fetch bookings.');
        }
      } catch (error) {
        toast.error('Failed to connect to the server.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, [token, navigate]);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  return (
    <div className="min-h-screen w-full bg-muted/40">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight font-['Sora']">Welcome, {user?.email}!</h1>
              <p className="text-muted-foreground mt-1">Here's a list of your past and upcoming trips.</p>
            </div>
            <Button asChild className="mt-4 sm:mt-0">
              <Link to="/"><PlusCircle className="w-4 h-4 mr-2" /> Book a New Trip</Link>
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
              <CardDescription>A history of all your trips booked with VietRide AI.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead className="hidden md:table-cell">Operator</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : bookings.length > 0 ? (
                    bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="font-medium">{booking.trip.from} to {booking.trip.to}</div>
                          <div className="text-sm text-muted-foreground md:hidden">{booking.trip.operator}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{booking.trip.operator}</TableCell>
                        <TableCell className="hidden lg:table-cell">{format(new Date(booking.bookingDate), 'PPP')}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(booking.trip.price)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No bookings found. Time to plan your next adventure!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}