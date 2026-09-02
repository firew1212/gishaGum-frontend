
import { apiRequest } from './api';

export interface BookingRoomInput {
  roomId: string;
}

export interface BookingGuestInput {
  fullName: string;
  phone: string;
  nationalId: string;
  nationality: string;
  email?: string;
  isPrimary?: boolean;
}

export interface CreateBookingRequest {
  checkIn: string;
  checkOut: string;
  rooms: BookingRoomInput[];
  guests: BookingGuestInput[];
}

export interface BookingRoom {
  id: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  isActive: boolean;
  room: {
    id: string;
    roomNumber: string;
    floor: number;
    status: string;
    roomType: {
      id: string;
      name: string;
      description: string | null;
      price: string;
      amenities: string[];
      images: string[];
    };
  };
}

export interface BookingGuest {
  id: string;
  bookingId: string;
  fullName: string;
  phone: string;
  nationalId: string;
  nationality: string;
  email: string | null;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatedBooking {
  id: string;
  bookingReference: string;
  customerId: string;
  checkIn: string;
  checkOut: string;
  status:
    | 'PENDING'
    | 'CONFIRMED'
    | 'CHECKED_IN'
    | 'CHECKED_OUT'
    | 'CANCELLED';
  totalAmount: string;
  rooms: BookingRoom[];
  guests: BookingGuest[];
  createdAt: string;
  updatedAt: string;
}

export async function createBooking(
  data: CreateBookingRequest,
): Promise<CreatedBooking> {
  return apiRequest<CreatedBooking>('/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

