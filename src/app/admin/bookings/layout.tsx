import type { ReactNode } from 'react';

import ProtectedRoute from '@/src/components/auth/ProtectedRoute';

interface BookingsLayoutProps {
  children: ReactNode;
}

export default function BookingsLayout({
  children,
}: BookingsLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'CASHIER']}>
      {children}
    </ProtectedRoute>
  );
}