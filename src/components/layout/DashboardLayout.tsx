
'use client';

import type { ReactNode } from 'react';

import ProtectedRoute from '@/src/components/auth/ProtectedRoute';
import Header from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="dashboard-layout">
        <Header />

        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
