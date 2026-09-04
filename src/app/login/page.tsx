'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ApiError } from '@/src/lib/api';
import { useAuth } from '@/src/components/auth/AuthProvider';

export default function LoginPage() {
const router = useRouter();
const { login, user, isLoading: authLoading } = useAuth();

const [phone, setPhone] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);

useEffect(() => {
if (!authLoading && user) {
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

  await login({
    phone: phone.trim(),
    password,
  });

  router.replace('/');
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
return ( <section className="section"> <div className="loading"> <span
         className="spinner"
         aria-hidden="true"
       /> </div> </section>
);
}

return ( <section className="section">
<div
className="container"
style={{ maxWidth: 520 }}
>
<div className="card" style={{ padding: 32 }}>
<div style={{ textAlign: 'center' }}> <span className="badge badge-primary">
Welcome back </span>


        <h1
          className="heading-lg"
          style={{ marginTop: 18 }}
        >
          Sign in to your account
        </h1>

        <p
          className="text-muted"
          style={{
            marginTop: 10,
            lineHeight: 1.7,
          }}
        >
          Manage your bookings and enjoy a simpler
          hotel experience.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            marginTop: 24,
            padding: 14,
            borderRadius: 12,
            background: 'var(--danger-50)',
            color: 'var(--danger-600)',
            fontSize: '.875rem',
            lineHeight: 1.5,
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          marginTop: 28,
        }}
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
            className="form-input"
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
            className="form-input"
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
          className="btn btn-primary btn-lg"
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
                  borderTopColor: 'var(--white)',
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
            'Sign in'
          )}
        </button>
      </form>

      <p
        style={{
          margin: '24px 0 0',
          textAlign: 'center',
          color: 'var(--gray-600)',
          fontSize: '.875rem',
        }}
      >
        Don't have an account?{' '}
        <Link
          href="/register"
          style={{
            color: 'var(--primary-600)',
            fontWeight: 700,
          }}
        >
          Create one
        </Link>
      </p>
    </div>
  </div>
</section>


);
}
