'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ApiError } from '@/src/lib/api';
import { useAuth } from '@/src/components/auth/AuthProvider';

interface FormValues {
  fullName: string;
  phone: string;
  email: string;
  nationalId: string;
  nationality: string;
  password: string;
  confirmPassword: string;
}

const initialValues: FormValues = {
  fullName: '',
  phone: '',
  email: '',
  nationalId: '',
  nationality: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    user,
    isLoading: authLoading,
  } = useAuth();

  const [form, setForm] = useState<FormValues>(
    initialValues,
  );

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/');
    }
  }, [authLoading, user, router]);

  function updateField(
    field: keyof FormValues,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');

    if (!form.fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!form.phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }

    if (!form.nationalId.trim()) {
      setError('Please enter your national ID.');
      return;
    }

    if (!form.nationality.trim()) {
      setError('Please enter your nationality.');
      return;
    }

    if (form.password.length < 8) {
      setError(
        'Password must be at least 8 characters long.',
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);

      await register({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        nationalId: form.nationalId.trim(),
        nationality: form.nationality.trim(),
        password: form.password,
      });

      setSuccess(true);

      setTimeout(() => {
        router.replace('/login');
      }, 1200);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError(
          'Unable to create your account right now. Please try again.',
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
    <section className="auth-page auth-register-page">
      <div
        className="auth-background"
        aria-hidden="true"
      >
        <div className="auth-background-glow auth-background-glow-one" />
        <div className="auth-background-glow auth-background-glow-two" />
      </div>

      <div className="container auth-container auth-register-container">
        <div className="auth-card auth-register-card fade-up">
          <div className="auth-card-header">
            <div
              className="auth-logo-mark"
              aria-hidden="true"
            >
              H
            </div>

            <span className="badge badge-primary">
              Get started
            </span>

            <h1 className="auth-title">
              Create your account
            </h1>

            <p className="auth-description">
              Create an account to search rooms, make
              bookings, and manage your stay.
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
                  We couldn&apos;t create your account.
                </strong>

                <p>{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div
              className="auth-success"
              role="status"
            >
              <span
                className="auth-success-icon"
                aria-hidden="true"
              >
                ✓
              </span>

              <div>
                <strong>
                  Account created successfully.
                </strong>

                <p>
                  Redirecting you to sign in...
                </p>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="auth-form-grid"
          >
            <div className="form-group">
              <label
                htmlFor="fullName"
                className="form-label"
              >
                Full name
              </label>

              <input
                id="fullName"
                type="text"
                autoComplete="name"
                className="form-input auth-input"
                placeholder="Your full name"
                value={form.fullName}
                onChange={(event) =>
                  updateField(
                    'fullName',
                    event.target.value,
                  )
                }
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="phone"
                className="form-label"
              >
                Phone number
              </label>

              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                className="form-input auth-input"
                placeholder="Your phone number"
                value={form.phone}
                onChange={(event) =>
                  updateField(
                    'phone',
                    event.target.value,
                  )
                }
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="email"
                className="form-label"
              >
                Email{' '}
                <span className="text-muted">
                  (optional)
                </span>
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                className="form-input auth-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(event) =>
                  updateField(
                    'email',
                    event.target.value,
                  )
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="nationalId"
                className="form-label"
              >
                National ID
              </label>

              <input
                id="nationalId"
                type="text"
                className="form-input auth-input"
                placeholder="Your national ID"
                value={form.nationalId}
                onChange={(event) =>
                  updateField(
                    'nationalId',
                    event.target.value,
                  )
                }
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="nationality"
                className="form-label"
              >
                Nationality
              </label>

              <input
                id="nationality"
                type="text"
                autoComplete="country-name"
                className="form-input auth-input"
                placeholder="Your nationality"
                value={form.nationality}
                onChange={(event) =>
                  updateField(
                    'nationality',
                    event.target.value,
                  )
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
                type="password"
                autoComplete="new-password"
                className="form-input auth-input"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(event) =>
                  updateField(
                    'password',
                    event.target.value,
                  )
                }
                disabled={isSubmitting}
                required
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="confirmPassword"
                className="form-label"
              >
                Confirm password
              </label>

              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="form-input auth-input"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={(event) =>
                  updateField(
                    'confirmPassword',
                    event.target.value,
                  )
                }
                disabled={isSubmitting}
                required
                minLength={8}
              />
            </div>

            <div className="auth-form-submit">
              <button
                type="submit"
                className="btn btn-primary btn-lg auth-submit"
                disabled={
                  isSubmitting || success
                }
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

                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <span
                      className="auth-submit-arrow"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="auth-divider">
            <span />
            <p>Already have an account?</p>
            <span />
          </div>

          <Link
            href="/login"
            className="auth-secondary-link"
          >
            Sign in to your account
            <span aria-hidden="true">→</span>
          </Link>

          <p className="auth-footer-note">
            Your account lets you manage bookings and
            keep your hotel stay organized.
          </p>
        </div>
      </div>
    </section>
  );
}