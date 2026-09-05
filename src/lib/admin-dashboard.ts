import type { Booking } from './bookings-api';
import type { AdminPayment } from './admin-api';
import type { Room } from './rooms-api';

export interface DashboardMetrics {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  unavailableRooms: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  checkedInBookings: number;
  checkedOutBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  paidPayments: number;
  pendingPayments: number;
}

function toNumber(value: number | string | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function calculateDashboardMetrics(
  rooms: Room[],
  bookings: Booking[],
  payments: AdminPayment[],
): DashboardMetrics {
  const totalRevenue = payments
    .filter((payment) => payment.status === 'PAID')
    .reduce((total, payment) => total + toNumber(payment.amount), 0);

  return {
    totalRooms: rooms.length,

    availableRooms: rooms.filter(
      (room) => room.status === 'AVAILABLE',
    ).length,

    occupiedRooms: rooms.filter(
      (room) => room.status === 'OCCUPIED',
    ).length,

    maintenanceRooms: rooms.filter(
      (room) => room.status === 'MAINTENANCE',
    ).length,

    unavailableRooms: rooms.filter(
      (room) => room.status === 'OUT_OF_SERVICE',
    ).length,

    totalBookings: bookings.length,

    pendingBookings: bookings.filter(
      (booking) => booking.status === 'PENDING',
    ).length,

    confirmedBookings: bookings.filter(
      (booking) => booking.status === 'CONFIRMED',
    ).length,

    checkedInBookings: bookings.filter(
      (booking) => booking.status === 'CHECKED_IN',
    ).length,

    checkedOutBookings: bookings.filter(
      (booking) => booking.status === 'CHECKED_OUT',
    ).length,

    cancelledBookings: bookings.filter(
      (booking) => booking.status === 'CANCELLED',
    ).length,

    totalRevenue,

    paidPayments: payments.filter(
      (payment) => payment.status === 'PAID',
    ).length,

    pendingPayments: payments.filter(
      (payment) => payment.status === 'PENDING',
    ).length,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value?: string): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function getRecentBookings(
  bookings: Booking[],
  limit = 5,
): Booking[] {
  return [...bookings]
    .sort((first, second) => {
      const firstDate = new Date(first.createdAt ?? 0).getTime();
      const secondDate = new Date(second.createdAt ?? 0).getTime();

      return secondDate - firstDate;
    })
    .slice(0, limit);
}