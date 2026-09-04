import type {
  Booking,
  BookingStatus,
} from './bookings-api';

export function formatBookingPrice(
  amount: number | string,
): string {
  const numericAmount =
    typeof amount === 'string'
      ? Number(amount)
      : amount;

  if (!Number.isFinite(numericAmount)) {
    return '0.00';
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

export function calculateNights(
  checkIn: string,
  checkOut: string,
): number {
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);

  const difference =
    end.getTime() - start.getTime();

  if (difference <= 0) {
    return 0;
  }

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24),
  );
}

export function formatBookingDate(
  date: string,
): string {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
}

export function getBookingStatusLabel(
  status: BookingStatus,
): string {
  switch (status) {
    case 'PENDING':
      return 'Pending';

    case 'CONFIRMED':
      return 'Confirmed';

    case 'CHECKED_IN':
      return 'Checked in';

    case 'CHECKED_OUT':
      return 'Checked out';

    case 'CANCELLED':
      return 'Cancelled';

    default:
      return status;
  }
}

export function getBookingStatusClass(
  status: BookingStatus,
): string {
  switch (status) {
    case 'PENDING':
      return 'booking-status-pending';

    case 'CONFIRMED':
      return 'booking-status-confirmed';

    case 'CHECKED_IN':
      return 'booking-status-checked-in';

    case 'CHECKED_OUT':
      return 'booking-status-checked-out';

    case 'CANCELLED':
      return 'booking-status-cancelled';

    default:
      return '';
  }
}

export function canCancelBooking(
  booking: Booking,
): boolean {
  return (
    booking.status !== 'CANCELLED' &&
    booking.status !== 'CHECKED_IN' &&
    booking.status !== 'CHECKED_OUT'
  );
}