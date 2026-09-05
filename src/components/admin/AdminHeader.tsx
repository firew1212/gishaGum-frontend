'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/src/components/auth/AuthProvider';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 19V5a2 2 0 0 0-2-2h-7" />
    </svg>
  );
}

export default function AdminHeader({
  onMenuClick,
}: AdminHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button
          type="button"
          className="admin-menu-button"
          aria-label="Open admin navigation"
          onClick={onMenuClick}
        >
          <MenuIcon />
        </button>

        <div>
          <p className="admin-header-eyebrow">Management portal</p>
          <h1 className="admin-header-title">Administration</h1>
        </div>
      </div>

      <div className="admin-header-right">
        <div className="admin-profile-wrapper">
          <button
            type="button"
            className="admin-profile-button"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen((current) => !current)}
          >
            <span className="admin-profile-avatar" aria-hidden="true">
              {user?.fullName?.charAt(0).toUpperCase() ?? 'A'}
            </span>

            <span className="admin-profile-text">
              <strong>{user?.fullName ?? 'Administrator'}</strong>
              <small>{user?.role ?? 'ADMIN'}</small>
            </span>

            <span className="admin-profile-chevron" aria-hidden="true">
              {profileOpen ? '⌃' : '⌄'}
            </span>
          </button>

          {profileOpen && (
            <div className="admin-profile-menu">
              <div className="admin-profile-menu-heading">
                <UserIcon />
                <span>Account</span>
              </div>

              <div className="admin-profile-menu-info">
                <strong>{user?.fullName ?? 'Administrator'}</strong>
                <span>{user?.email ?? user?.phone ?? ''}</span>
              </div>

              <button
                type="button"
                className="admin-logout-button"
                onClick={handleLogout}
              >
                <LogoutIcon />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}