export interface Trip {
  id: string;
  operator: string;
  operatorLogo: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  vehicleType: 'Sleeper Bus' | 'Limousine' | 'Seater Bus';
  rating: number;
  availableSeats: number;
}
export const mockTrips: Trip[] = [
  {
    id: 'HN-SP-001',
    operator: 'Sapa Express',
    operatorLogo: '/sapa-express.png',
    from: 'Hanoi',
    to: 'Sapa',
    departureTime: '07:00',
    arrivalTime: '12:30',
    duration: '5h 30m',
    price: 350000,
    vehicleType: 'Sleeper Bus',
    rating: 4.8,
    availableSeats: 22,
  },
  {
    id: 'HN-SP-002',
    operator: 'GreenLion Bus',
    operatorLogo: '/green-lion.png',
    from: 'Hanoi',
    to: 'Sapa',
    departureTime: '22:00',
    arrivalTime: '03:30',
    duration: '5h 30m',
    price: 320000,
    vehicleType: 'Sleeper Bus',
    rating: 4.5,
    availableSeats: 15,
  },
  {
    id: 'HN-SP-003',
    operator: 'Sao Viet',
    operatorLogo: '/sao-viet.png',
    from: 'Hanoi',
    to: 'Sapa',
    departureTime: '09:00',
    arrivalTime: '14:00',
    duration: '5h 00m',
    price: 450000,
    vehicleType: 'Limousine',
    rating: 4.9,
    availableSeats: 8,
  },
  {
    id: 'HCM-DL-001',
    operator: 'Phuong Trang',
    operatorLogo: '/phuong-trang.png',
    from: 'Ho Chi Minh City',
    to: 'Da Lat',
    departureTime: '23:00',
    arrivalTime: '05:00',
    duration: '6h 00m',
    price: 280000,
    vehicleType: 'Sleeper Bus',
    rating: 4.6,
    availableSeats: 30,
  },
  {
    id: 'HCM-DL-002',
    operator: 'Thanh Buoi',
    operatorLogo: '/thanh-buoi.png',
    from: 'Ho Chi Minh City',
    to: 'Da Lat',
    departureTime: '10:00',
    arrivalTime: '16:30',
    duration: '6h 30m',
    price: 300000,
    vehicleType: 'Sleeper Bus',
    rating: 4.7,
    availableSeats: 18,
  },
  {
    id: 'DN-HA-001',
    operator: 'Hoi An Express',
    operatorLogo: '/hoi-an-express.png',
    from: 'Da Nang',
    to: 'Hoi An',
    departureTime: '11:00',
    arrivalTime: '11:45',
    duration: '45m',
    price: 120000,
    vehicleType: 'Seater Bus',
    rating: 4.9,
    availableSeats: 25,
  },
  {
    id: 'HN-HL-001',
    operator: 'Kumho Viet Thanh',
    operatorLogo: '/kumho.png',
    from: 'Hanoi',
    to: 'Ha Long',
    departureTime: '08:00',
    arrivalTime: '10:30',
    duration: '2h 30m',
    price: 250000,
    vehicleType: 'Limousine',
    rating: 4.8,
    availableSeats: 7,
  },
];