import type { ReactNode } from 'react';

interface DashboardSectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

export default function DashboardSection({
  title,
  description,
  action,
  children,
}: DashboardSectionProps) {
  return (
    <section className="dashboard-section">
      <div className="dashboard-section-heading">
        <div>
          <h3 className="dashboard-section-title">{title}</h3>

          {description && (
            <p className="dashboard-section-description">
              {description}
            </p>
          )}
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}