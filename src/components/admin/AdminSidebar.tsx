'use client';

import Link from 'next/link';
import { useAuth } from '@/src/components/auth/AuthProvider';

import AdminNavLink from './AdminNavLink';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function RoomIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M3 21V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v16" />
      <path d="M3 17h18" />
      <path d="M7 13h3v-3H7z" />
      <path d="M14 13h3v-3h-3z" />
      <path d="M7 7h3V5H7z" />
      <path d="M14 7h3V5h-3z" />
    </svg>
  );
}

function BookingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="m8 15 2 2 5-5" />
    </svg>
  );
}

function PaymentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export default function AdminSidebar({
  isOpen,
  onClose,
}: AdminSidebarProps) {
  const { user } = useAuth();

  return (
    <>
      <aside
        className={`admin-sidebar ${isOpen ? 'admin-sidebar-open' : ''}`}
        aria-label="Admin navigation"
      >
        <div className="admin-sidebar-top">
          <Link href="/" className="admin-brand" onClick={onClose}>
            <span className="admin-brand-mark" aria-hidden="true">
              H
            </span>

            <span>
              <strong>Hotel Booking</strong>
              <small>Administration</small>
            </span>
          </Link>

          <button
            type="button"
            className="admin-sidebar-close"
            aria-label="Close admin navigation"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="admin-sidebar-user">
          <div className="admin-user-avatar" aria-hidden="true">
            {user?.fullName?.charAt(0).toUpperCase() ?? 'A'}
          </div>

          <div className="admin-user-details">
            <strong>{user?.fullName ?? 'Administrator'}</strong>
            <span>{user?.role ?? 'ADMIN'}</span>
          </div>
        </div>

        <nav className="admin-sidebar-navigation">
          <p className="admin-navigation-label">Overview</p>

          <AdminNavLink
            href="/admin"
            label="Dashboard"
            exact
            icon={<DashboardIcon />}
            onNavigate={onClose}
          />

          <p className="admin-navigation-label">Management</p>

          <AdminNavLink
            href="/admin/rooms"
            label="Rooms"
            icon={<RoomIcon />}
            onNavigate={onClose}
          />

          <AdminNavLink
            href="/admin/bookings"
            label="Bookings"
            icon={<BookingIcon />}
            onNavigate={onClose}
          />

        </nav>

        <div className="admin-sidebar-bottom">
          <Link href="/" className="admin-back-link" onClick={onClose}>
            <span aria-hidden="true">←</span>
            Back to website
          </Link>
        </div>
      </aside>

      {isOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}
    </>
  );
}