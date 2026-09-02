
'use client';

import Link from 'next/link';

import { useAuth } from '@/src/context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="header-container">
        <Link
          href="/dashboard"
          className="site-logo"
        >
          Hotel Booking
        </Link>

        <nav className="header-nav">
          {user && (
            <span className="user-name">
              {user.fullName}
            </span>
          )}

          <button
            type="button"
            onClick={logout}
            className="logout-button"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

