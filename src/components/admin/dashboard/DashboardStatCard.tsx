interface DashboardStatCardProps {
  label: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  tone?: 'blue' | 'green' | 'orange' | 'purple';
}

export default function DashboardStatCard({
  label,
  value,
  description,
  icon,
  tone = 'blue',
}: DashboardStatCardProps) {
  return (
    <article className={`dashboard-stat-card dashboard-stat-card-${tone}`}>
      <div className="dashboard-stat-card-top">
        <span className="dashboard-stat-card-label">{label}</span>

        <span className="dashboard-stat-card-icon" aria-hidden="true">
          {icon}
        </span>
      </div>

      <strong className="dashboard-stat-card-value">{value}</strong>

      <span className="dashboard-stat-card-description">
        {description}
      </span>
    </article>
  );
}