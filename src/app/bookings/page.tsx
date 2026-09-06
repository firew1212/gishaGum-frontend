'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useAuth } from '@/src/components/auth/AuthProvider';
import ProtectedRoute from '@/src/components/auth/ProtectedRoute';

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
  return (
    <ProtectedRoute>
      <MyBookingsContent />
    </ProtectedRoute>
  );
}

function MyBookingsContent() {
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
          <div className="my-bookings-auth-card">
            <div className="my-bookings-empty-icon">
              <span aria-hidden="true">🔐</span>
            </div>

            <span className="badge badge-primary">
              Your account
            </span>

            <h1>Sign in to view your bookings</h1>

            <p>
              Please sign in to your account to view and
              manage your hotel reservations.
            </p>

            <div className="my-bookings-empty-actions">
              <Link
                href="/login?redirect=/bookings"
                className="btn btn-primary btn-lg"
              >
                Sign in
              </Link>

              <Link
                href="/rooms"
                className="btn btn-secondary"
              >
                Explore rooms
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="my-bookings-page">
      <div className="container">
        {/* =====================================================
            PAGE HEADER
            ===================================================== */}
        <div className="my-bookings-header">
          <div className="my-bookings-header-copy">
            <span className="badge badge-primary">
              Your account
            </span>

            <h1>My bookings</h1>

            <p>
              View and manage your hotel reservations
              in one place.
            </p>
          </div>

          <Link
            href="/rooms"
            className="btn btn-primary"
          >
            Find a room
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* =====================================================
            ERROR
            ===================================================== */}
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

        {/* =====================================================
            EMPTY STATE
            ===================================================== */}
        {!error && bookings.length === 0 && (
          <div className="my-bookings-empty">
            <div className="my-bookings-empty-icon">
              <span aria-hidden="true">🧳</span>
            </div>

            <span className="badge badge-primary">
              Start your stay
            </span>

            <h2>No bookings yet</h2>

            <p>
              You haven&apos;t made a hotel reservation yet.
              Find a room and start planning your stay.
            </p>

            <Link
              href="/rooms"
              className="btn btn-primary btn-lg"
            >
              Explore rooms
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}

        {/* =====================================================
            BOOKINGS LIST
            ===================================================== */}
        {!error && bookings.length > 0 && (
          <div className="my-bookings-content">
            <div className="my-bookings-list-heading">
              <div>
                <p className="text-primary">
                  Reservation history
                </p>

                <h2>Your reservations</h2>
              </div>

              <span className="room-result-count">
                {bookings.length}{' '}
                {bookings.length === 1
                  ? 'booking'
                  : 'bookings'}
              </span>
            </div>

            <div className="my-bookings-list">
              {bookings.map((booking) => {
                const firstRoom = booking.rooms[0]?.room;
                const roomType = firstRoom?.roomType;

                return (
                  <article
                    key={booking.id}
                    className="booking-list-card"
                  >
                    <div className="booking-list-main">
                      <div className="booking-list-image">
                        {roomType?.images[0] ? (
                          <img
                            src={roomType.images[0]}
                            alt={roomType.name}
                          />
                        ) : (
                          <div
                            className="booking-list-image-placeholder"
                            aria-hidden="true"
                          >
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
                              {roomType?.name || 'Hotel room'}
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
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}