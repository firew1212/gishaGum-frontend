'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/src/components/auth/AuthProvider';

const navigation = [
  { label: 'Home', href: '/' },
  { label: 'Rooms', href: '/rooms' },
];

export default function Header() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function handleLogout() {
    logout();
    closeMobileMenu();
    router.replace('/');
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        {/* Brand */}
        <Link
          href="/"
          className="site-logo"
          aria-label="Hotel Booking home"
          onClick={closeMobileMenu}
        >
          <span className="site-logo-mark" aria-hidden="true">
            H
          </span>

          <span className="site-logo-text">
            Hotel Booking
          </span>
        </Link>

        {/* Navigation */}
        <nav
          id="primary-navigation"
          className={`site-nav ${
            mobileMenuOpen ? 'site-nav-open' : ''
          }`}
          aria-label="Primary navigation"
        >
          <div className="site-nav-links">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="site-nav-link"
                onClick={closeMobileMenu}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Account actions */}
          <div className="site-nav-actions">
            {isLoading ? (
              <span className="header-loading">
                <span className="header-loading-dot" />
                Loading...
              </span>
            ) : user ? (
              <>
                <Link
  href="/account"
  className="header-account-link"
  onClick={closeMobileMenu}
>
  <span
    className="header-user-avatar"
    aria-hidden="true"
  >
    {(user.fullName ?? 'U').charAt(0).toUpperCase()}
  </span>

  <span className="header-user-name">
    {user.fullName ?? 'Account'}
  </span>
</Link>

                <button
                  type="button"
                  className="btn btn-primary header-register-button"
                  onClick={handleLogout}
                >
                  <Link href={"/login"} >
                     Log out
                  </Link>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="header-login-link"
                  onClick={closeMobileMenu}
                >
                  Log in
                </Link>

                <Link
                  href="/register"
                  className="btn btn-primary header-register-button"
                  onClick={closeMobileMenu}
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Mobile menu */}
        <button
          type="button"
          className={`mobile-menu-button ${
            mobileMenuOpen
              ? 'mobile-menu-button-open'
              : ''
          }`}
          aria-label={
            mobileMenuOpen
              ? 'Close navigation menu'
              : 'Open navigation menu'
          }
          aria-expanded={mobileMenuOpen}
          aria-controls="primary-navigation"
          onClick={() =>
            setMobileMenuOpen(
              (current) => !current,
            )
          }
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}