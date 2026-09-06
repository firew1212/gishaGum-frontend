
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from '@/src/components/auth/AuthProvider';
import ProtectedRoute from '@/src/components/auth/ProtectedRoute';

import {
  getMyBooking,
  type Booking,
} from '@/src/lib/bookings-api';

import {
  formatBookingDate,
  formatBookingPrice,
  getBookingStatusClass,
  getBookingStatusLabel,
} from '@/src/lib/booking-utils';

export default function BookingSuccessPage() {
  return (
    <ProtectedRoute>
      <BookingSuccessContent />
    </ProtectedRoute>
  );
}

function BookingSuccessContent() {
  const params = useParams<{ id: string }>();

  const { accessToken, isAuthenticated, isLoading: authLoading } =
    useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
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
              : 'Unable to load your booking.',
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

  if (authLoading || loading) {
    return (
      <section className="booking-confirmation-page">
        <div className="container">
          <div className="booking-loading">
            <span
              className="spinner"
              aria-hidden="true"
            />

            <p>
              {authLoading
                ? 'Verifying your account...'
                : 'Preparing your booking...'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !booking) {
    return (
      <section className="booking-confirmation-page">
        <div className="container">
          <div className="booking-confirmation-error">
            <h1>
              Booking not found
            </h1>

            <p>
              {error ||
                'We could not find this booking.'}
            </p>

            <div
              className="booking-confirmation-actions"
              style={{ marginTop: 24 }}
            >
              <Link
                href="/bookings"
                className="btn btn-primary"
              >
                My bookings
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

  const firstRoom = booking.rooms[0];

  return (
    <section className="booking-confirmation-page">
      <div className="container">
        <div className="booking-success-card">
          <div
            className="booking-success-icon"
            aria-hidden="true"
          >
            ✓
          </div>

          <span className="badge badge-success">
            Booking created
          </span>

          <h1>
            Your room is reserved
          </h1>

          <p className="booking-success-description">
            Your reservation has been created
            successfully. Please complete the
            payment process to confirm your
            booking.
          </p>

          <div className="booking-reference-card">
            <span>
              Booking reference
            </span>

            <strong>
              {booking.bookingReference}
            </strong>
          </div>

          <div className="booking-confirmation-grid">
            <div>
              <span>
                Status
              </span>

              <strong
                className={`booking-status ${getBookingStatusClass(
                  booking.status,
                )}`}
              >
                {getBookingStatusLabel(
                  booking.status,
                )}
              </strong>
            </div>

            <div>
              <span>
                Check-in
              </span>

              <strong>
                {formatBookingDate(
                  booking.checkIn,
                )}
              </strong>
            </div>

            <div>
              <span>
                Check-out
              </span>

              <strong>
                {formatBookingDate(
                  booking.checkOut,
                )}
              </strong>
            </div>

            <div>
              <span>
                Total
              </span>

              <strong>
                {formatBookingPrice(
                  booking.totalAmount,
                )}
              </strong>
            </div>
          </div>

          <div className="booking-confirmation-room">
            <div>
              <span className="booking-summary-eyebrow">
                Your room
              </span>

              <h2>
                {firstRoom?.room.roomType.name ||
                  'Hotel room'}
              </h2>

              {firstRoom && (
                <p>
                  Room {firstRoom.room.roomNumber}
                  {' · '}
                  Floor {firstRoom.room.floor}
                </p>
              )}
            </div>
          </div>

          <div className="booking-confirmation-actions">
            <Link
              href={`/bookings/${booking.id}`}
              className="btn btn-primary btn-lg"
            >
              View booking
            </Link>

            <Link
              href="/rooms"
              className="btn btn-secondary btn-lg"
            >
              Explore more rooms
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

