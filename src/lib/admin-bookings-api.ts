import { apiRequest } from './api';
import type {
  Booking,
  BookingStatus,
} from './bookings-api';

export type { Booking, BookingStatus };

export interface UpdateBookingStatusPayload {
  status: BookingStatus;
}

/**
 * Get all bookings.
 *
 * Backend:
 * GET /api/bookings
 *
 * Access:
 * ADMIN and CASHIER
 */
export async function getAdminBookings(
  accessToken: string,
): Promise<Booking[]> {
  return apiRequest<Booking[]>('/bookings', {
    method: 'GET',
    token: accessToken,
  });
}

/**
 * Get one booking by ID.
 *
 * Backend:
 * GET /api/bookings/:id
 *
 * Access:
 * ADMIN and CASHIER
 */
export async function getAdminBooking(
  bookingId: string,
  accessToken: string,
): Promise<Booking> {
  return apiRequest<Booking>(`/bookings/${bookingId}`, {
    method: 'GET',
    token: accessToken,
  });
}

/**
 * Update a booking status.
 *
 * Backend:
 * PATCH /api/bookings/:id/status
 *
 * Access:
 * ADMIN and CASHIER
 */
export async function updateBookingStatus(
  bookingId: string,
  payload: UpdateBookingStatusPayload,
  accessToken: string,
): Promise<Booking> {
  return apiRequest<Booking>(
    `/bookings/${bookingId}/status`,
    {
      method: 'PATCH',
      token: accessToken,
      body: JSON.stringify(payload),
    },
  );
}

/**
 * Check in a booking.
 *
 * Backend:
 * PATCH /api/bookings/:id/check-in
 *
 * Access:
 * ADMIN and CASHIER
 */
export async function checkInBooking(
  bookingId: string,
  accessToken: string,
): Promise<Booking> {
  return apiRequest<Booking>(
    `/bookings/${bookingId}/check-in`,
    {
      method: 'PATCH',
      token: accessToken,
    },
  );
}

/**
 * Check out a booking.
 *
 * Backend:
 * PATCH /api/bookings/:id/check-out
 *
 * Access:
 * ADMIN and CASHIER
 */
export async function checkOutBooking(
  bookingId: string,
  accessToken: string,
): Promise<Booking> {
  return apiRequest<Booking>(
    `/bookings/${bookingId}/check-out`,
    {
      method: 'PATCH',
      token: accessToken,
    },
  );
}