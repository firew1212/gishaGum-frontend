
'use client';

import DashboardLayout from '@/src/components/layout/DashboardLayout';
import { useAuth } from '@/src/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <section className="dashboard-welcome">
        <h1>
          Welcome, {user?.fullName}!
        </h1>

        <p>
          Welcome to your hotel dashboard.
        </p>
      </section>
    </DashboardLayout>
  );
}

