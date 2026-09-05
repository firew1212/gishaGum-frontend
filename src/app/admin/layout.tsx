import type { ReactNode } from 'react';

import ProtectedRoute from '@/src/components/auth/ProtectedRoute';
import AdminShell from '@/src/components/admin/AdminShell';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}