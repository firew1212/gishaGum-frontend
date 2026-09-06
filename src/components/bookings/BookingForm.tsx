
'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';

import { useAuth } from '@/src/components/auth/AuthProvider';
import type { Room } from '@/src/lib/rooms-api';
import {
  calculateNights,
  formatBookingPrice,
} from '@/src/lib/booking-utils';
import { createBooking } from '@/src/lib/bookings-api';

interface BookingFormProps {
  room: Room;
}

interface GuestForm {
  fullName: string;
  phone: string;
  nationalId: string;
  nationality: string;
  email: string;
}

function getToday(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getTomorrow(): string {
  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function BookingForm({ room }: BookingFormProps) {
  const { accessToken, isAuthenticated, isLoading: authLoading } = useAuth();

  const [checkIn, setCheckIn] = useState(getToday());
  const [checkOut, setCheckOut] = useState(getTomorrow());

  const [guest, setGuest] = useState<GuestForm>({
    fullName: '',
    phone: '',
    nationalId: '',
    nationality: '',
    email: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const nights = useMemo(
    () => calculateNights(checkIn, checkOut),
    [checkIn, checkOut],
  );

  const price =
    typeof room.roomType.price === 'string'
      ? Number(room.roomType.price)
      : room.roomType.price;

  const total = Number.isFinite(price) ? price * nights : 0;

  function updateGuest(field: keyof GuestForm, value: string) {
    setGuest((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleCheckInChange(value: string) {
    setCheckIn(value);

    if (!value) {
      return;
    }

    if (checkOut <= value) {
      const nextDay = new Date(`${value}T00:00:00`);

      nextDay.setDate(nextDay.getDate() + 1);

      const year = nextDay.getFullYear();
      const month = String(nextDay.getMonth() + 1).padStart(2, '0');
      const day = String(nextDay.getDate()).padStart(2, '0');

      setCheckOut(`${year}-${month}-${day}`);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');

    if (authLoading) {
      setError('Please wait while your account is being verified.');
      return;
    }

    if (!isAuthenticated || !accessToken) {
      setError('Please sign in before creating a booking.');
      return;
    }

    if (!checkIn || !checkOut) {
      setError('Please select your check-in and check-out dates.');
      return;
    }

    if (checkOut <= checkIn) {
      setError('Check-out must be after check-in.');
      return;
    }

    if (nights < 1) {
      setError('Your stay must be at least one night.');
      return;
    }

    if (!guest.fullName.trim()) {
      setError('Please enter the guest full name.');
      return;
    }

    if (!guest.phone.trim()) {
      setError('Please enter the guest phone number.');
      return;
    }

    if (!guest.nationalId.trim()) {
      setError('Please enter the guest national ID.');
      return;
    }

    if (!guest.nationality.trim()) {
      setError('Please enter the guest nationality.');
      return;
    }

    try {
      setSubmitting(true);

      const booking = await createBooking(
        {
          checkIn,
          checkOut,
          rooms: [
            {
              roomId: room.id,
            },
          ],
          guests: [
            {
              fullName: guest.fullName.trim(),
              phone: guest.phone.trim(),
              nationalId: guest.nationalId.trim(),
              nationality: guest.nationality.trim(),
              ...(guest.email.trim()
                ? {
                    email: guest.email.trim(),
                  }
                : {}),
              isPrimary: true,
            },
          ],
        },
        accessToken,
      );

      window.location.href = `/bookings/${booking.id}/success`;
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to create your booking.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="booking-layout" onSubmit={handleSubmit}>
      <div className="booking-main">
        <div className="booking-section-card">
          <div className="booking-section-heading">
            <div className="booking-step-number">01</div>

            <div>
              <p className="booking-section-kicker">Your stay</p>

              <h2>Choose your dates</h2>

              <p>Tell us when you plan to stay.</p>
            </div>
          </div>

          <div className="booking-date-grid">
            <div className="form-group">
              <label
                htmlFor="booking-check-in"
                className="form-label"
              >
                Check-in
              </label>

              <input
                id="booking-check-in"
                type="date"
                className="form-input booking-date-input"
                value={checkIn}
                min={getToday()}
                onChange={(event) =>
                  handleCheckInChange(event.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="booking-check-out"
                className="form-label"
              >
                Check-out
              </label>

              <input
                id="booking-check-out"
                type="date"
                className="form-input booking-date-input"
                value={checkOut}
                min={checkIn || getTomorrow()}
                onChange={(event) =>
                  setCheckOut(event.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="booking-night-summary">
            <span>Length of stay</span>

            <strong>
              {nights} {nights === 1 ? 'night' : 'nights'}
            </strong>
          </div>
        </div>

        <div className="booking-section-card">
          <div className="booking-section-heading">
            <div className="booking-step-number">02</div>

            <div>
              <p className="booking-section-kicker">Guest details</p>

              <h2>Who is staying?</h2>

              <p>Enter the primary guest's information.</p>
            </div>
          </div>

          <div className="booking-form-grid">
            <div className="form-group booking-field-full">
              <label
                htmlFor="guest-full-name"
                className="form-label"
              >
                Full name
              </label>

              <input
                id="guest-full-name"
                type="text"
                className="form-input"
                placeholder="Enter full name"
                value={guest.fullName}
                onChange={(event) =>
                  updateGuest('fullName', event.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="guest-phone"
                className="form-label"
              >
                Phone number
              </label>

              <input
                id="guest-phone"
                type="tel"
                className="form-input"
                placeholder="+251..."
                value={guest.phone}
                onChange={(event) =>
                  updateGuest('phone', event.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="guest-nationality"
                className="form-label"
              >
                Nationality
              </label>

              <input
                id="guest-nationality"
                type="text"
                className="form-input"
                placeholder="Nationality"
                value={guest.nationality}
                onChange={(event) =>
                  updateGuest('nationality', event.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="guest-national-id"
                className="form-label"
              >
                National ID
              </label>

              <input
                id="guest-national-id"
                type="text"
                className="form-input"
                placeholder="National ID"
                value={guest.nationalId}
                onChange={(event) =>
                  updateGuest('nationalId', event.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label
                htmlFor="guest-email"
                className="form-label"
              >
                Email
                <span className="optional-label">Optional</span>
              </label>

              <input
                id="guest-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={guest.email}
                onChange={(event) =>
                  updateGuest('email', event.target.value)
                }
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="booking-error" role="alert">
            <span
              className="booking-error-icon"
              aria-hidden="true"
            >
              !
            </span>

            <div>
              <strong>We couldn't create your booking.</strong>

              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="booking-form-actions">
          <Link
            href={`/rooms/${room.id}`}
            className="btn btn-secondary"
          >
            Back to room
          </Link>

          <button
            type="submit"
            className="btn btn-primary btn-lg booking-submit-button"
            disabled={submitting || authLoading}
          >
            {submitting ? (
              <>
                <span
                  className="button-spinner"
                  aria-hidden="true"
                />
                Creating booking...
              </>
            ) : authLoading ? (
              'Checking account...'
            ) : (
              'Continue to confirmation'
            )}
          </button>
        </div>
      </div>

      <aside className="booking-summary">
        <div className="booking-summary-card">
          <div className="booking-summary-image">
            {room.roomType.images[0] ? (
              <img
                src={room.roomType.images[0]}
                alt={`${room.roomType.name} room`}
              />
            ) : (
              <div className="booking-summary-placeholder">
                <span aria-hidden="true">🏨</span>
              </div>
            )}
          </div>

          <div className="booking-summary-content">
            <p className="booking-summary-eyebrow">
              Selected room
            </p>

            <h2>{room.roomType.name}</h2>

            <p className="booking-summary-room">
              Room {room.roomNumber} · Floor {room.floor}
            </p>

            <div className="booking-summary-divider" />

            <div className="booking-summary-row">
              <span>
                {formatBookingPrice(room.roomType.price)} × {nights}{' '}
                {nights === 1 ? 'night' : 'nights'}
              </span>

              <strong>{formatBookingPrice(total)}</strong>
            </div>

            <div className="booking-summary-total">
              <span>Total</span>

              <strong>{formatBookingPrice(total)}</strong>
            </div>

            <div className="booking-summary-note">
              <span aria-hidden="true">✓</span>

              <p>
                Your booking will be created as pending. Payment
                comes in the next step.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </form>
  );
}
