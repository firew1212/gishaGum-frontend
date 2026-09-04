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
return ( <section className="section"> <div className="loading"> <span
         className="spinner"
         aria-hidden="true"
       /> </div> </section>
);
}

return ( <section className="section">
<div
className="container"
style={{ maxWidth: 680 }}
>
<div className="card" style={{ padding: 32 }}>
<div style={{ textAlign: 'center' }}> <span className="badge badge-primary">
Get started </span>


        <h1
          className="heading-lg"
          style={{ marginTop: 18 }}
        >
          Create your account
        </h1>

        <p
          className="text-muted"
          style={{
            marginTop: 10,
            lineHeight: 1.7,
          }}
        >
          Create an account to search rooms, make
          bookings, and manage your stay.
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

      {success && (
        <div
          role="status"
          style={{
            marginTop: 24,
            padding: 14,
            borderRadius: 12,
            background: 'var(--success-50)',
            color: 'var(--success-600)',
            fontSize: '.875rem',
            lineHeight: 1.5,
          }}
        >
          Account created successfully. Redirecting
          you to sign in...
        </div>
      )}

     <form
  onSubmit={handleSubmit}
  noValidate
  className="auth-form-grid"
  style={{
    display: 'grid',
    gridTemplateColumns:
      'repeat(2, minmax(0, 1fr))',
    gap: 20,
    marginTop: 28,
  }}
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
            className="form-input"
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
            className="form-input"
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
            Email <span className="text-muted">(optional)</span>
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            className="form-input"
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
            className="form-input"
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
            className="form-input"
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
            className="form-input"
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
            className="form-input"
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

        <div
          style={{
            gridColumn: '1 / -1',
            marginTop: 4,
          }}
        >
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={isSubmitting || success}
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
              'Create account'
            )}
          </button>
        </div>
      </form>

      <p
        style={{
          margin: '24px 0 0',
          textAlign: 'center',
          color: 'var(--gray-600)',
          fontSize: '.875rem',
        }}
      >
        Already have an account?{' '}
        <Link
          href="/login"
          style={{
            color: 'var(--primary-600)',
            fontWeight: 700,
          }}
        >
          Sign in
        </Link>
      </p>
    </div>
  </div>
</section>


);
}
