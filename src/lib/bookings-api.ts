
import { apiRequest } from './api';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED';

export interface CreateBookingRoom {
  roomId: string;
}

export interface CreateBookingGuest {
  fullName: string;
  phone: string;
  nationalId: string;
  nationality: string;
  email?: string;
  isPrimary?: boolean;
}

export interface CreateBookingPayload {
  checkIn: string;
  checkOut: string;
  rooms: CreateBookingRoom[];
  guests: CreateBookingGuest[];
}

export interface BookingRoomType {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
  amenities: string[];
  images: string[];
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
    roomType: BookingRoomType;
  };
}

export interface BookingGuest {
  id: string;
  fullName: string;
  phone: string;
  nationalId: string;
  nationality: string;
  email?: string | null;
  isPrimary: boolean;
}

export interface BookingPayment {
  id: string;
  txRef?: string | null;
  gatewayReference?: string | null;
  amount?: number | string;
  status?: string;
  paidAt?: string | null;
}

export interface Booking {
  id: string;
  bookingReference: string;
  customerId: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  totalAmount: number | string;
  createdAt?: string;
  updatedAt?: string;
  rooms: BookingRoom[];
  guests: BookingGuest[];
  payments: BookingPayment[];
}

export async function createBooking(
  payload: CreateBookingPayload,
  accessToken: string,
): Promise<Booking> {
  return apiRequest<Booking>('/bookings', {
    method: 'POST',
    token: accessToken,
    body: JSON.stringify(payload),
  });
}

export async function getMyBookings(
  accessToken: string,
): Promise<Booking[]> {
  return apiRequest<Booking[]>('/bookings/my', {
    method: 'GET',
    token: accessToken,
  });
}

export async function getMyBooking(
  id: string,
  accessToken: string,
): Promise<Booking> {
  return apiRequest<Booking>(`/bookings/my/${id}`, {
    method: 'GET',
    token: accessToken,
  });
}

export async function cancelBooking(
  id: string,
  accessToken: string,
): Promise<Booking> {
  return apiRequest<Booking>(`/bookings/${id}/cancel`, {
    method: 'PATCH',
    token: accessToken,
  });
}

