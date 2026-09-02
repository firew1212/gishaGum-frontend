
'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { registerUser } from '@/src/lib/auth-api';
import { clearAuth } from '@/src/lib/auth-storage';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    nationalId: '',
    nationality: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError('');
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      await registerUser({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        nationalId: form.nationalId.trim(),
        nationality: form.nationality.trim(),
        password: form.password,
      });

      clearAuth();

      router.push('/login');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to create your account. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page register-page">
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
              Your journey begins here
            </p>

            <h2>
              Stay somewhere
              <br />
              worth remembering.
            </h2>

            <p>
              Create your account and discover
              comfortable rooms, thoughtful
              amenities, and effortless booking.
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

      {/* Form side */}
      <section className="auth-panel">
        <div className="auth-card">
          <div className="mobile-auth-brand">
            <Link href="/">
              Hotel Booking
            </Link>
          </div>

          <header className="auth-header">
            <div className="auth-step">
              <span>01</span>
              <span>CREATE ACCOUNT</span>
            </div>

            <h1>
              Welcome.
              <br />
              Let&apos;s get you settled.
            </h1>

            <p>
              Create your account to manage your
              stays and make future bookings easier.
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
                  <h2>Personal details</h2>
                  <p>
                    Tell us a little about yourself.
                  </p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group form-group-full">
                  <label htmlFor="fullName">
                    Full name
                    <span>*</span>
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Abebe Kebede"
                    autoComplete="name"
                    required
                    disabled={loading}
                  />
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
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+251 9..."
                    autoComplete="tel"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nationality">
                    Nationality
                    <span>*</span>
                  </label>

                  <input
                    id="nationality"
                    name="nationality"
                    type="text"
                    value={form.nationality}
                    onChange={handleChange}
                    placeholder="e.g. Ethiopian"
                    autoComplete="country-name"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nationalId">
                    National ID
                    <span>*</span>
                  </label>

                  <input
                    id="nationalId"
                    name="nationalId"
                    type="text"
                    value={form.nationalId}
                    onChange={handleChange}
                    placeholder="Enter your ID number"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email address
                    <small>Optional</small>
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="form-divider" />

            <div className="form-section">
              <div className="form-section-heading">
                <span>02</span>

                <div>
                  <h2>Secure your account</h2>
                  <p>
                    Choose a password only you know.
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Password
                  <span>*</span>
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  minLength={8}
                />

                <div className="password-hint">
                  <span>●</span>
                  Use at least 8 characters.
                </div>
              </div>
            </div>

            {error && (
              <div
                className="auth-error"
                role="alert"
              >
                <strong>
                  Something went wrong
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
                  ? 'Creating your account...'
                  : 'Create my account'}
              </span>

              {!loading && (
                <span aria-hidden="true">
                  →
                </span>
              )}
            </button>

            <p className="auth-terms">
              By creating an account, you agree to
              use our hotel booking service
              responsibly.
            </p>
          </form>

          <footer className="auth-footer">
            <span>
              Already have an account?
            </span>

            <Link
              href="/login"
              className="auth-link"
            >
              Sign in
            </Link>
          </footer>
        </div>
      </section>
    </main>
  );
}

