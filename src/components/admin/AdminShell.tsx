'use client';

import { useState, type ReactNode } from 'react';

import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

interface AdminShellProps {
  children: ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-shell">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="admin-content-wrapper">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}