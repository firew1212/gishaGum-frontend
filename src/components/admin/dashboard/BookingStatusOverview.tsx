import type { DashboardMetrics } from '@/src/lib/admin-dashboard';

interface BookingStatusOverviewProps {
  metrics: DashboardMetrics;
}

const bookingStatuses = [
  {
    key: 'pendingBookings',
    label: 'Pending',
    className: 'pending',
  },
  {
    key: 'confirmedBookings',
    label: 'Confirmed',
    className: 'confirmed',
  },
  {
    key: 'checkedInBookings',
    label: 'Checked in',
    className: 'checked-in',
  },
  {
    key: 'checkedOutBookings',
    label: 'Checked out',
    className: 'checked-out',
  },
  {
    key: 'cancelledBookings',
    label: 'Cancelled',
    className: 'cancelled',
  },
] as const;

export default function BookingStatusOverview({
  metrics,
}: BookingStatusOverviewProps) {
  return (
    <div className="dashboard-booking-status-list">
      {bookingStatuses.map((status) => (
        <div className="dashboard-booking-status-item" key={status.key}>
          <div className="dashboard-booking-status-name">
            <span
              className={`dashboard-status-dot dashboard-status-dot-${status.className}`}
            />

            <span>{status.label}</span>
          </div>

          <strong>{metrics[status.key]}</strong>
        </div>
      ))}
    </div>
  );
}