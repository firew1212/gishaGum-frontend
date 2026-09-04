'use client';

import Link from 'next/link';

import { useAuth } from '@/src/components/auth/AuthProvider';

export default function HomePage() {
const { user, isLoading } = useAuth();

return ( <section className="section"> <div className="container">
<div
className="fade-up"
style={{ maxWidth: 760 }}
> <span className="badge badge-primary">
Hotel Booking </span>


      <h1
        className="heading-xl"
        style={{ marginTop: 18 }}
      >
        {user
          ? `Welcome back, ${user.fullName}.`
          : 'Your stay, beautifully simple.'}
      </h1>

      <p
        className="text-lead"
        style={{
          maxWidth: 680,
          marginTop: 24,
        }}
      >
        Discover comfortable rooms, check
        availability, and manage your hotel stay
        from one simple platform.
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginTop: 32,
        }}
      >
        <Link
          href="/rooms"
          className="btn btn-primary btn-lg"
        >
          Explore rooms
        </Link>

        {!isLoading && !user && (
          <Link
            href="/register"
            className="btn btn-secondary btn-lg"
          >
            Create account
          </Link>
        )}

        {!isLoading && user && (
          <Link
            href="/account"
            className="btn btn-secondary btn-lg"
          >
            My account
          </Link>
        )}
      </div>
    </div>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit,minmax(220px,1fr))',
        gap: 20,
        marginTop: 64,
      }}
    >
      <article
        className="card card-hover"
        style={{ padding: 24 }}
      >
        <span className="badge badge-success">
          Simple
        </span>

        <h2
          className="heading-md"
          style={{ marginTop: 18 }}
        >
          Easy booking
        </h2>

        <p
          className="text-muted"
          style={{
            marginTop: 10,
            lineHeight: 1.7,
          }}
        >
          Find available rooms and complete your
          reservation in a few straightforward steps.
        </p>
      </article>

      <article
        className="card card-hover"
        style={{ padding: 24 }}
      >
        <span className="badge badge-primary">
          Comfortable
        </span>

        <h2
          className="heading-md"
          style={{ marginTop: 18 }}
        >
          Quality rooms
        </h2>

        <p
          className="text-muted"
          style={{
            marginTop: 10,
            lineHeight: 1.7,
          }}
        >
          Choose from rooms prepared for a
          comfortable and enjoyable stay.
        </p>
      </article>

      <article
        className="card card-hover"
        style={{ padding: 24 }}
      >
        <span className="badge badge-primary">
          Secure
        </span>

        <h2
          className="heading-md"
          style={{ marginTop: 18 }}
        >
          Secure account
        </h2>

        <p
          className="text-muted"
          style={{
            marginTop: 10,
            lineHeight: 1.7,
          }}
        >
          Your authenticated account keeps your
          bookings and customer information connected.
        </p>
      </article>
    </div>
  </div>
</section>


);
}
