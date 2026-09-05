import type { DashboardMetrics } from '@/src/lib/admin-dashboard';

interface RoomStatusOverviewProps {
  metrics: DashboardMetrics;
}

const roomStatuses = [
  {
    key: 'availableRooms',
    label: 'Available',
    className: 'available',
  },
  {
    key: 'occupiedRooms',
    label: 'Occupied',
    className: 'occupied',
  },
  {
    key: 'maintenanceRooms',
    label: 'Maintenance',
    className: 'maintenance',
  },
  {
    key: 'unavailableRooms',
    label: 'Out of service',
    className: 'unavailable',
  },
] as const;

export default function RoomStatusOverview({
  metrics,
}: RoomStatusOverviewProps) {
  return (
    <div className="dashboard-room-status">
      {roomStatuses.map((status) => {
        const value = metrics[status.key];
        const percentage =
          metrics.totalRooms > 0
            ? Math.round((value / metrics.totalRooms) * 100)
            : 0;

        return (
          <div className="dashboard-room-status-row" key={status.key}>
            <div className="dashboard-room-status-label">
              <span
                className={`dashboard-status-dot dashboard-status-dot-${status.className}`}
              />

              <span>{status.label}</span>
            </div>

            <strong>{value}</strong>

            <div className="dashboard-room-status-bar">
              <span
                className={`dashboard-room-status-progress dashboard-room-status-progress-${status.className}`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            <span className="dashboard-room-status-percentage">
              {percentage}%
            </span>
          </div>
        );
      })}
    </div>
  );
}