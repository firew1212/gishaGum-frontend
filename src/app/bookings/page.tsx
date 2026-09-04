
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useAuth } from '@/src/components/auth/AuthProvider';

import {
  getMyBookings,
  type Booking,
} from '@/src/lib/bookings-api';

import {
  formatBookingDate,
  formatBookingPrice,
  getBookingStatusClass,
  getBookingStatusLabel,
} from '@/src/lib/booking-utils';

export default function MyBookingsPage() {
  const {
    accessToken,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadBookings() {
      if (authLoading) {
        return;
      }

      if (!isAuthenticated || !accessToken) {
        if (mounted) {
          setError('Please sign in to view your bookings.');
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);
        setError('');

        const data = await getMyBookings(accessToken);

        if (mounted) {
          setBookings(data);
        }
      } catch (requestError) {
        if (mounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to load your bookings.',
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadBookings();

    return () => {
      mounted = false;
    };
  }, [accessToken, isAuthenticated, authLoading]);

  if (authLoading || loading) {
    return (
      <section className="my-bookings-page">
        <div className="container">
          <div className="booking-loading">
            <span
              className="spinner"
              aria-hidden="true"
            />

            <p>
              {authLoading
                ? 'Verifying your account...'
                : 'Loading your bookings...'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!isAuthenticated || !accessToken) {
    return (
      <section className="my-bookings-page">
        <div className="container">
          <div className="my-bookings-empty">
            <div className="my-bookings-empty-icon">
              <span aria-hidden="true">🔐</span>
            </div>

            <h1>Sign in to view your bookings</h1>

            <p>
              Please sign in to your account to view and manage
              your hotel reservations.
            </p>

            <Link
              href="/login?redirect=/bookings"
              className="btn btn-primary btn-lg"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="my-bookings-page">
      <div className="container">
        <div className="my-bookings-header">
          <div>
            <span className="badge badge-primary">
              Your account
            </span>

            <h1>My bookings</h1>

            <p>
              View and manage your hotel reservations in one place.
            </p>
          </div>

          <Link
            href="/rooms"
            className="btn btn-primary"
          >
            Find a room
          </Link>
        </div>

        {error && (
          <div
            className="booking-error"
            role="alert"
          >
            <span
              className="booking-error-icon"
              aria-hidden="true"
            >
              !
            </span>

            <div>
              <strong>
                Unable to load bookings
              </strong>

              <p>{error}</p>
            </div>
          </div>
        )}

        {!error && bookings.length === 0 && (
          <div className="my-bookings-empty">
            <div className="my-bookings-empty-icon">
              <span aria-hidden="true">🧳</span>
            </div>

            <h2>No bookings yet</h2>

            <p>
              You haven't made a hotel reservation yet.
              Find a room and start planning your stay.
            </p>

            <Link
              href="/rooms"
              className="btn btn-primary btn-lg"
            >
              Explore rooms
            </Link>
          </div>
        )}

        {!error && bookings.length > 0 && (
          <div className="my-bookings-list">
            {bookings.map((booking) => {
              const firstRoom = booking.rooms[0]?.room;

              return (
                <article
                  key={booking.id}
                  className="booking-list-card"
                >
                  <div className="booking-list-main">
                    <div className="booking-list-image">
                      {firstRoom?.roomType.images[0] ? (
                        <img
                          src={firstRoom.roomType.images[0]}
                          alt={firstRoom.roomType.name}
                        />
                      ) : (
                        <div aria-hidden="true">
                          🏨
                        </div>
                      )}
                    </div>

                    <div className="booking-list-info">
                      <div className="booking-list-top">
                        <div>
                          <span className="booking-list-reference">
                            {booking.bookingReference}
                          </span>

                          <h2>
                            {firstRoom?.roomType.name ||
                              'Hotel room'}
                          </h2>
                        </div>

                        <span
                          className={`booking-status ${getBookingStatusClass(
                            booking.status,
                          )}`}
                        >
                          {getBookingStatusLabel(
                            booking.status,
                          )}
                        </span>
                      </div>

                      <div className="booking-list-meta">
                        <div>
                          <span>Check-in</span>

                          <strong>
                            {formatBookingDate(
                              booking.checkIn,
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Check-out</span>

                          <strong>
                            {formatBookingDate(
                              booking.checkOut,
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Guests</span>

                          <strong>
                            {booking.guests.length}
                          </strong>
                        </div>

                        <div>
                          <span>Total</span>

                          <strong>
                            {formatBookingPrice(
                              booking.totalAmount,
                            )}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="booking-list-action">
                    <Link
                      href={`/bookings/${booking.id}`}
                      className="btn btn-secondary"
                    >
                      View details
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

