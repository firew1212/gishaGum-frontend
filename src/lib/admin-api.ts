import { apiRequest } from './api';
import type { Booking } from './bookings-api';
import type { PaymentStatus } from './payments-api';
import type { Room } from './rooms-api';

export interface AdminPayment {
  id: string;
  bookingId: string;
  amount: number | string;
  paymentType: string;
  paymentMethod: string;
  status: PaymentStatus | string;
  txRef: string;
  gatewayReference?: string | null;
  paidAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  booking?: {
    id: string;
    bookingReference: string;
    customer?: {
      fullName: string;
      phone?: string;
      email?: string | null;
    };
  };
}

export interface AdminDashboardData {
  rooms: Room[];
  bookings: Booking[];
  payments: AdminPayment[];
}

export async function getAdminBookings(
  accessToken: string,
): Promise<Booking[]> {
  return apiRequest<Booking[]>('/bookings', {
    method: 'GET',
    token: accessToken,
  });
}

export async function getAdminPayments(
  accessToken: string,
): Promise<AdminPayment[]> {
  return apiRequest<AdminPayment[]>('/payments', {
    method: 'GET',
    token: accessToken,
  });
}

export async function getAdminDashboardData(
  accessToken: string,
): Promise<AdminDashboardData> {
  const [rooms, bookings, payments] = await Promise.all([
    apiRequest<Room[]>('/rooms', {
      method: 'GET',
      token: accessToken,
    }),

    getAdminBookings(accessToken),

    getAdminPayments(accessToken),
  ]);

  return {
    rooms,
    bookings,
    payments,
  };
}