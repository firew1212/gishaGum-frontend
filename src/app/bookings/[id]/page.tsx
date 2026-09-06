
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from '@/src/components/auth/AuthProvider';

import {
  cancelBooking,
  getMyBooking,
  type Booking,
} from '@/src/lib/bookings-api';

import {
  canCancelBooking,
  formatBookingDate,
  formatBookingPrice,
  getBookingStatusClass,
  getBookingStatusLabel,
} from '@/src/lib/booking-utils';

export default function BookingDetailsPage() {
  const params = useParams<{ id: string }>();

  const {
    accessToken,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadBooking() {
      if (authLoading) {
        return;
      }

      if (!isAuthenticated || !accessToken) {
        if (mounted) {
          setError('Please sign in to view your booking.');
          setLoading(false);
        }

        return;
      }

      if (!params.id) {
        if (mounted) {
          setError('Booking ID is missing.');
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);
        setError('');

        const data = await getMyBooking(
          params.id,
          accessToken,
        );

        if (mounted) {
          setBooking(data);
        }
      } catch (requestError) {
        if (mounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to load this booking.',
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadBooking();

    return () => {
      mounted = false;
    };
  }, [
    params.id,
    accessToken,
    isAuthenticated,
    authLoading,
  ]);

  async function handleCancel() {
    if (!booking || !accessToken) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to cancel this booking?',
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(true);
      setError('');

      const updated = await cancelBooking(
        booking.id,
        accessToken,
      );

      setBooking(updated);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to cancel this booking.',
      );
    } finally {
      setCancelling(false);
    }
  }

  if (authLoading || loading) {
    return (
      <section className="booking-details-page">
        <div className="container">
          <div className="booking-loading">
            <span
              className="spinner"
              aria-hidden="true"
            />

            <p>
              {authLoading
                ? 'Verifying your account...'
                : 'Loading booking details...'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error && !booking) {
    return (
      <section className="booking-details-page">
        <div className="container">
          <div className="booking-error">
            <strong>
              We couldn't load this booking.
            </strong>

            <p>{error}</p>

            <div
              className="booking-confirmation-actions"
              style={{ marginTop: 24 }}
            >
              <Link
                href="/bookings"
                className="btn btn-secondary"
              >
                Back to bookings
              </Link>

              <Link
                href="/rooms"
                className="btn btn-primary"
              >
                Explore rooms
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <section className="booking-details-page">
      <div className="container">
        <Link
          href="/bookings"
          className="booking-back-link"
        >
          ← Back to my bookings
        </Link>

        <div className="booking-details-header">
          <div>
            <span className="badge badge-primary">
              Reservation
            </span>

            <h1>
              {booking.bookingReference}
            </h1>

            <p>
              Created{' '}
              {booking.createdAt
                ? formatBookingDate(
                    booking.createdAt,
                  )
                : 'recently'}
            </p>
          </div>

          <span
            className={`booking-status booking-status-large ${getBookingStatusClass(
              booking.status,
            )}`}
          >
            {getBookingStatusLabel(
              booking.status,
            )}
          </span>
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
                Action couldn't be completed
              </strong>

              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="booking-details-layout">
          <main>
            <div className="booking-details-card">
              <div className="booking-details-card-heading">
                <div>
                  <span className="booking-summary-eyebrow">
                    Stay
                  </span>

                  <h2>
                    Your reservation
                  </h2>
                </div>
              </div>

              <div className="booking-stay-grid">
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
                  <span>Rooms</span>

                  <strong>
                    {booking.rooms.length}
                  </strong>
                </div>

                <div>
                  <span>Guests</span>

                  <strong>
                    {booking.guests.length}
                  </strong>
                </div>
              </div>
            </div>

            <div className="booking-details-card">
              <div className="booking-details-card-heading">
                <div>
                  <span className="booking-summary-eyebrow">
                    Accommodation
                  </span>

                  <h2>
                    Room details
                  </h2>
                </div>
              </div>

              <div className="booking-room-list">
                {booking.rooms.map(
                  (bookingRoom) => (
                    <div
                      key={bookingRoom.id}
                      className="booking-room-detail"
                    >
                      <div className="booking-room-detail-image">
                        {bookingRoom.room.roomType.images[0] ? (
                          <img
                            src={
                              bookingRoom.room
                                .roomType
                                .images[0]
                            }
                            alt={
                              bookingRoom.room
                                .roomType
                                .name
                            }
                          />
                        ) : (
                          <div aria-hidden="true">
                            🏨
                          </div>
                        )}
                      </div>

                      <div>
                        <span>
                          Room{' '}
                          {
                            bookingRoom.room
                              .roomNumber
                          }
                        </span>

                        <h3>
                          {
                            bookingRoom.room
                              .roomType
                              .name
                          }
                        </h3>

                        <p>
                          Floor{' '}
                          {
                            bookingRoom.room
                              .floor
                          }
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="booking-details-card">
              <div className="booking-details-card-heading">
                <div>
                  <span className="booking-summary-eyebrow">
                    Guests
                  </span>

                  <h2>
                    Guest information
                  </h2>
                </div>
              </div>

              <div className="booking-guests-list">
                {booking.guests.map(
                  (guest) => (
                    <div
                      key={guest.id}
                      className="booking-guest-card"
                    >
                      <div className="booking-guest-avatar">
                        {guest.fullName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h3>
                          {guest.fullName}
                        </h3>

                        {guest.isPrimary && (
                          <span className="badge badge-primary">
                            Primary guest
                          </span>
                        )}

                        <p>
                          {guest.phone}
                        </p>

                        <p>
                          {guest.nationality}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </main>

          <aside>
            <div className="booking-details-summary">
              <span className="booking-summary-eyebrow">
                Payment summary
              </span>

              <h2>
                Booking total
              </h2>

              <div className="booking-detail-total">
                <span>
                  Total amount
                </span>

                <strong>
                  {formatBookingPrice(
                    booking.totalAmount,
                  )}
                </strong>
              </div>

              <div className="booking-payment-status">
                <span>
                  Booking status
                </span>

                <strong>
                  {getBookingStatusLabel(
                    booking.status,
                  )}
                </strong>
              </div>

              <div className="booking-details-summary-note">
                Payment processing will be
                available in the next step.
              </div>

              {booking.status === 'PENDING' && (
  <Link
    href={`/bookings/${booking.id}/payment`}
    className="btn btn-primary btn-lg booking-pay-button"
  >
    Pay now
  </Link>
)}

              {canCancelBooking(booking) && (
                <button
                  type="button"
                  className="booking-cancel-button"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling
                    ? 'Cancelling...'
                    : 'Cancel booking'}
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

