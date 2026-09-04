'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from '@/src/components/auth/AuthProvider';
import BookingForm from '@/src/components/bookings/BookingForm';
import {
  getRoom,
} from '@/src/lib/rooms-api';
import type { Room } from '@/src/lib/rooms-api';

export default function BookRoomPage() {
  const params =
    useParams<{ id: string }>();

  const { user } = useAuth();

  const [room, setRoom] =
    useState<Room | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    let mounted = true;

    async function loadRoom() {
      try {
        setLoading(true);
        setError('');

        const data =
          await getRoom(params.id);

        if (mounted) {
          setRoom(data);
        }
      } catch (requestError) {
        if (mounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to load the selected room.',
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (params.id) {
      loadRoom();
    }

    return () => {
      mounted = false;
    };
  }, [params.id]);

  if (!user) {
    return (
      <section className="booking-page">
        <div className="container">
          <div className="booking-auth-required">
            <div className="booking-auth-icon">
              <span aria-hidden="true">
                🔐
              </span>
            </div>

            <span className="badge badge-primary">
              Account required
            </span>

            <h1>
              Sign in to book your stay
            </h1>

            <p>
              Please sign in to your account
              before continuing with your
              reservation.
            </p>

            <div className="booking-auth-actions">
              <Link
                href={`/login?redirect=/rooms/${params.id}/book`}
                className="btn btn-primary btn-lg"
              >
                Sign in
              </Link>

              <Link
                href="/register"
                className="btn btn-secondary btn-lg"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="booking-page">
        <div className="container">
          <div className="booking-loading">
            <span
              className="spinner"
              aria-hidden="true"
            />

            <p>
              Loading booking details...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !room) {
    return (
      <section className="booking-page">
        <div className="container">
          <div
            className="booking-error booking-page-error"
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
                We couldn't load this room.
              </strong>

              <p>
                {error ||
                  'The requested room could not be found.'}
              </p>

              <Link
                href="/rooms"
                className="btn btn-secondary"
              >
                Back to rooms
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="booking-page">
      <div className="container">
        <div className="booking-page-header">
          <Link
            href={`/rooms/${room.id}`}
            className="booking-back-link"
          >
            ← Back to room
          </Link>

          <div className="booking-header-content">
            <div>
              <span className="badge badge-primary">
                Secure reservation
              </span>

              <h1>
                Complete your booking
              </h1>

              <p>
                Enter your stay dates and
                guest information to reserve
                this room.
              </p>
            </div>

            <div className="booking-progress">
              <div className="booking-progress-item booking-progress-active">
                <span>1</span>
                <small>
                  Booking
                </small>
              </div>

              <div className="booking-progress-line" />

              <div className="booking-progress-item">
                <span>2</span>
                <small>
                  Payment
                </small>
              </div>
            </div>
          </div>
        </div>

        <BookingForm room={room} />
      </div>
    </section>
  );
}