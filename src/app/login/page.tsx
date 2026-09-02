
'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/src/context/AuthContext';
import { loginUser } from '@/src/lib/auth-api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    async function submitLogin() {
      setError('');
      setLoading(true);

      try {
        const response = await loginUser({
          phone: phone.trim(),
          password,
        });

        login(
          response.accessToken,
          response.user,
        );

        router.push('/');
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Unable to sign in. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    }

    submitLogin();
  }

  function handlePhoneChange(value: string) {
    setPhone(value);

    if (error) {
      setError('');
    }
  }

  function handlePasswordChange(value: string) {
    setPassword(value);

    if (error) {
      setError('');
    }
  }

  return (
    <main className="auth-page login-page">
      {/* Visual side */}
      <section className="auth-visual">
        <div className="auth-visual-overlay" />

        <div className="auth-visual-content">
          <Link
            href="/"
            className="auth-brand"
          >
            Hotel Booking
          </Link>

          <div className="auth-visual-copy">
            <p className="eyebrow">
              Welcome back
            </p>

            <h2>
              Your stay
              <br />
              starts here.
            </h2>

            <p>
              Sign in to manage your reservations,
              discover comfortable rooms, and enjoy
              a simpler way to plan your next stay.
            </p>
          </div>

          <div className="auth-visual-footer">
            <span>Comfort</span>
            <span>•</span>
            <span>Convenience</span>
            <span>•</span>
            <span>Exceptional stays</span>
          </div>
        </div>
      </section>

      {/* Login panel */}
      <section className="auth-panel">
        <div className="auth-card login-card">
          <div className="mobile-auth-brand">
            <Link href="/">
              Hotel Booking
            </Link>
          </div>

          <header className="auth-header">
            <div className="auth-step">
              <span>01</span>
              <span>WELCOME BACK</span>
            </div>

            <h1>
              Good to see you.
            </h1>

            <p>
              Sign in to access your reservations
              and continue planning your stay.
            </p>
          </header>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="form-section">
              <div className="form-section-heading">
                <span>01</span>

                <div>
                  <h2>Your credentials</h2>
                  <p>
                    Enter your account details below.
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  Phone number
                  <span>*</span>
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    handlePhoneChange(
                      event.target.value,
                    )
                  }
                  placeholder="+251 9..."
                  autoComplete="tel"
                  inputMode="tel"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group login-password-group">
                <label htmlFor="password">
                  Password
                  <span>*</span>
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    handlePasswordChange(
                      event.target.value,
                    )
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div
                className="auth-error"
                role="alert"
              >
                <strong>
                  Unable to sign in
                </strong>

                <span>{error}</span>
              </div>
            )}

            <button
              className="auth-button"
              type="submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? 'Signing you in...'
                  : 'Sign in to your account'}
              </span>

              {!loading && (
                <span aria-hidden="true">
                  →
                </span>
              )}
            </button>
          </form>

          <footer className="auth-footer">
            <span>
              Don&apos;t have an account?
            </span>

            <Link
              href="/register"
              className="auth-link"
            >
              Create an account
            </Link>
          </footer>
        </div>
      </section>
    </main>
  );
}
