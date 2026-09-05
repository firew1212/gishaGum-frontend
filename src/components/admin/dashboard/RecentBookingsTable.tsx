import Link from 'next/link';

import type { Booking } from '@/src/lib/bookings-api';
import {
  formatCurrency,
  formatDate,
} from '@/src/lib/admin-dashboard';

interface RecentBookingsTableProps {
  bookings: Booking[];
}

function getStatusClass(status: Booking['status']): string {
  return `status-badge status-badge-${status.toLowerCase()}`;
}

export default function RecentBookingsTable({
  bookings,
}: RecentBookingsTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="dashboard-empty-state">
        <strong>No bookings yet</strong>
        <p>Recent bookings will appear here.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-table-wrapper">
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Customer</th>
            <th>Stay</th>
            <th>Amount</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>
                <strong className="dashboard-booking-reference">
                  {booking.bookingReference}
                </strong>
              </td>

              <td>
                <span className="dashboard-table-primary">
                  Booking customer
                </span>
              </td>

              <td>
                <span className="dashboard-table-primary">
                  {formatDate(booking.checkIn)}
                </span>

                <span className="dashboard-table-secondary">
                  to {formatDate(booking.checkOut)}
                </span>
              </td>

              <td>
                <strong>
                  {formatCurrency(Number(booking.totalAmount))}
                </strong>
              </td>

              <td>
                <span className={getStatusClass(booking.status)}>
                  {booking.status.replaceAll('_', ' ')}
                </span>
              </td>

              <td>
                <Link
                  href={`/admin/bookings/${booking.id}`}
                  className="dashboard-table-action"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}