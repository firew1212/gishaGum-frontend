'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ApiError } from '@/src/lib/api';
import { useAuth } from '@/src/components/auth/AuthProvider';

export default function LoginPage() {
  const router = useRouter();

  const {
    login,
    user,
    isLoading: authLoading,
  } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /*
   * Redirect an already-authenticated user
   * to the correct dashboard based on their role.
   */
  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    if (user.role === 'ADMIN') {
      router.replace('/admin');
    } else if (user.role === 'CASHIER') {
      router.replace('/cashier');
    } else {
      router.replace('/');
    }
  }, [authLoading, user, router]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');

    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setIsSubmitting(true);

      const loggedInUser = await login({
        phone: phone.trim(),
        password,
      });

      /*
       * Navigate immediately to the dashboard
       * belonging to the authenticated user's role.
       */
      if (loggedInUser.role === 'ADMIN') {
        router.replace('/admin');
      } else if (loggedInUser.role === 'CASHIER') {
        router.replace('/cashier');
      } else {
        router.replace('/');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError(
          'Unable to log in right now. Please try again.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading || user) {
    return (
      <section className="auth-page">
        <div className="auth-loading">
          <span
            className="spinner"
            aria-hidden="true"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="auth-page">
      <div
        className="auth-background"
        aria-hidden="true"
      >
        <div className="auth-background-glow auth-background-glow-one" />
        <div className="auth-background-glow auth-background-glow-two" />
      </div>

      <div className="container auth-container">
        <div className="auth-card fade-up">
          <div className="auth-card-header">
            <div
              className="auth-logo-mark"
              aria-hidden="true"
            >
              H
            </div>

            <span className="badge badge-primary">
              Welcome back
            </span>

            <h1 className="auth-title">
              Sign in to your account
            </h1>

            <p className="auth-description">
              Manage your bookings and enjoy a simpler
              hotel experience.
            </p>
          </div>

          {error && (
            <div
              className="auth-error"
              role="alert"
            >
              <span
                className="auth-message-icon"
                aria-hidden="true"
              >
                !
              </span>

              <div>
                <strong>
                  We couldn't sign you in.
                </strong>

                <p>{error}</p>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="auth-form"
          >
            <div className="form-group">
              <label
                htmlFor="phone"
                className="form-label"
              >
                Phone number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className="form-input auth-input"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="password"
                className="form-label"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="form-input auth-input"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                disabled={isSubmitting}
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner"
                    style={{
                      width: 18,
                      height: 18,
                      borderWidth: 2,
                      borderTopColor:
                        'var(--white)',
                      borderLeftColor:
                        'rgba(255,255,255,.35)',
                      borderRightColor:
                        'rgba(255,255,255,.35)',
                      borderBottomColor:
                        'rgba(255,255,255,.35)',
                    }}
                    aria-hidden="true"
                  />

                  Signing in...
                </>
              ) : (
                <>
                  Sign in

                  <span
                    className="auth-submit-arrow"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span />
            <p>New to Hotel Booking?</p>
            <span />
          </div>

          <Link
            href="/register"
            className="auth-secondary-link"
          >
            Create your account

            <span aria-hidden="true">
              →
            </span>
          </Link>

          <p className="auth-footer-note">
            Book your stay with confidence and manage
            everything from one place.
          </p>
        </div>
      </div>
    </section>
  );
}