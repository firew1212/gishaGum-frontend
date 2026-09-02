'use client';

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,

} from 'react';
import { useParams, useRouter } from 'next/navigation';

import DashboardLayout from '@/src/components/layout/DashboardLayout';
import { useAuth } from '@/src/context/AuthContext';
import {
  checkRoomAvailability,
  getRoomById,
  Room,
} from '@/src/lib/rooms-api';
import {
  createBooking,
  CreateBookingRequest,
} from '@/src/lib/bookings-api';

function formatDate(date: string) {
  if (!date) return '';

  const [year, month, day] = date.split('-').map(Number);

  const localDate = new Date(
    year,
    month - 1,
    day,
  );

  return localDate.toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  );
}

function calculateNights(
  checkIn: string,
  checkOut: string,
) {
  if (!checkIn || !checkOut) {
    return 0;
  }

  const [inYear, inMonth, inDay] =
    checkIn.split('-').map(Number);

  const [outYear, outMonth, outDay] =
    checkOut.split('-').map(Number);

  const start = new Date(
    inYear,
    inMonth - 1,
    inDay,
  );

  const end = new Date(
    outYear,
    outMonth - 1,
    outDay,
  );

  const difference =
    end.getTime() - start.getTime();

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24),
  );
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();

  const { user, isLoading: authLoading } =
    useAuth();

  const roomId = params.id as string;

  const [room, setRoom] =
    useState<Room | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState(false);

  const [bookingReference, setBookingReference] =
    useState('');

  const [checkIn, setCheckIn] =
    useState('');

  const [checkOut, setCheckOut] =
    useState('');

  const [fullName, setFullName] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [nationalId, setNationalId] =
    useState('');

  const [nationality, setNationality] =
    useState('');

  const [checkingAvailability, setCheckingAvailability] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    setFullName(user.fullName);
    setPhone(user.phone);
    setEmail(user.email ?? '');

    async function loadRoom() {
      try {
        setLoading(true);
        setError('');

        const data =
          await getRoomById(roomId);

        setRoom(data);
      } catch (err) {
        console.error(err);

        setError(
          'Unable to load this room. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    }

    if (roomId) {
      loadRoom();
    }
  }, [
    roomId,
    user,
    authLoading,
    router,
  ]);

  const nights = useMemo(
    () =>
      calculateNights(
        checkIn,
        checkOut,
      ),
    [checkIn, checkOut],
  );

  const totalAmount = useMemo(() => {
    if (!room || nights <= 0) {
      return 0;
    }

    return Number(room.roomType.price) * nights;
  }, [room, nights]);

  function validateForm() {
    if (!checkIn || !checkOut) {
      setError(
        'Please select your check-in and check-out dates.',
      );
      return false;
    }

    if (nights <= 0) {
      setError(
        'Check-out date must be after the check-in date.',
      );
      return false;
    }

    if (!fullName.trim()) {
      setError(
        'Please enter the guest full name.',
      );
      return false;
    }

    if (!phone.trim()) {
      setError(
        'Please enter a phone number.',
      );
      return false;
    }

    if (!nationalId.trim()) {
      setError(
        'Please enter the national ID.',
      );
      return false;
    }

    if (!nationality.trim()) {
      setError(
        'Please enter the nationality.',
      );
      return false;
    }

    if (!room) {
      setError(
        'Room information is unavailable.',
      );
      return false;
    }

    if (room.status !== 'AVAILABLE') {
      setError(
        'This room is currently unavailable.',
      );
      return false;
    }

    return true;
  }

  async function verifyRoomAvailability() {
    if (!room) {
      return false;
    }

    setCheckingAvailability(true);

    try {
      const availableRooms =
        await checkRoomAvailability({
          checkIn: new Date(
            `${checkIn}T00:00:00`,
          ).toISOString(),

          checkOut: new Date(
            `${checkOut}T00:00:00`,
          ).toISOString(),

          roomTypeId: room.roomTypeId,
        });

      const selectedRoomAvailable =
        availableRooms.some(
          (availableRoom) =>
            availableRoom.id === room.id,
        );

      if (!selectedRoomAvailable) {
        setError(
          'This room is no longer available for the selected dates. Please choose different dates.',
        );

        return false;
      }

      return true;
    } catch (err) {
      console.error(err);

      setError(
        'We could not verify room availability. Please try again.',
      );

      return false;
    } finally {
      setCheckingAvailability(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting || checkingAvailability) {
      return;
    }

    setError('');

    if (!validateForm()) {
      return;
    }

    setCheckingAvailability(true);

    let roomIsAvailable = false;

    try {
      const availableRooms =
        await checkRoomAvailability({
          checkIn: new Date(
            `${checkIn}T00:00:00`,
          ).toISOString(),

          checkOut: new Date(
            `${checkOut}T00:00:00`,
          ).toISOString(),

          roomTypeId: room!.roomTypeId,
        });

      roomIsAvailable =
        availableRooms.some(
          (availableRoom) =>
            availableRoom.id === room!.id,
        );
    } catch (err) {
      console.error(err);

      setError(
        'We could not verify room availability. Please try again.',
      );

      return;
    } finally {
      setCheckingAvailability(false);
    }

    if (!roomIsAvailable) {
      setError(
        'This room is no longer available for the selected dates. Please choose different dates.',
      );

      return;
    }

    setSubmitting(true);

    try {
      const bookingData: CreateBookingRequest = {
        checkIn: new Date(
          `${checkIn}T00:00:00`,
        ).toISOString(),

        checkOut: new Date(
          `${checkOut}T00:00:00`,
        ).toISOString(),

        rooms: [
          {
            roomId: room!.id,
          },
        ],

        guests: [
          {
            fullName: fullName.trim(),
            phone: phone.trim(),
            email: email.trim() || undefined,
            nationalId: nationalId.trim(),
            nationality: nationality.trim(),
            isPrimary: true,
          },
        ],
      };

      const booking =
        await createBooking(bookingData);

      setBookingReference(
        booking.bookingReference,
      );

      setSuccess(true);
    } catch (err) {
      console.error(err);

      setError(
        'We could not create your reservation. The room may have just been booked by another guest. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="booking-state">
          <div className="booking-state-icon">
            ...
          </div>

          <h2>Loading room...</h2>

          <p>
            Please wait while we prepare your
            reservation.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  if (error && !room) {
    return (
      <DashboardLayout>
        <div className="booking-state">
          <div className="booking-state-icon">
            !
          </div>

          <h2>Unable to load room</h2>

          <p>{error}</p>

          <button
            type="button"
            className="booking-primary-button"
            onClick={() =>
              router.push('/rooms')
            }
          >
            Browse Rooms
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (success && room) {
    return (
      <DashboardLayout>
        <div className="booking-page">
          <div className="booking-container">
            <div className="booking-success">
              <div className="booking-success-icon">
                ✓
              </div>

              <h1>
                Reservation Created
              </h1>

              <p>
                Your reservation has been
                successfully created and is
                waiting for confirmation.
              </p>

              <div className="booking-success-reference">
                <span>
                  Booking Reference
                </span>

                <strong>
                  {bookingReference}
                </strong>
              </div>

              <div className="booking-success-details">
                <div>
                  <span>Room</span>
                  <strong>
                    Room {room.roomNumber}
                  </strong>
                </div>

                <div>
                  <span>Check-in</span>
                  <strong>
                    {formatDate(checkIn)}
                  </strong>
                </div>

                <div>
                  <span>Check-out</span>
                  <strong>
                    {formatDate(checkOut)}
                  </strong>
                </div>

                <div>
                  <span>Nights</span>
                  <strong>
                    {nights}
                  </strong>
                </div>

                <div>
                  <span>Total</span>
                  <strong>
                    {totalAmount.toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    Pending
                  </strong>
                </div>
              </div>

              <div className="booking-success-actions">
                <button
                  type="button"
                  className="booking-primary-button"
                  onClick={() =>
                    router.push('/dashboard')
                  }
                >
                  Go to Dashboard
                </button>

                <button
                  type="button"
                  className="booking-secondary-button"
                  onClick={() =>
                    router.push('/rooms')
                  }
                >
                  Browse More Rooms
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="booking-page">
        <div className="booking-container">
          <button
            type="button"
            className="booking-back"
            onClick={() =>
              router.push(
                `/rooms/${room.id}`,
              )
            }
          >
            ← Back to room
          </button>

          <div className="booking-layout">
            <section className="booking-form-panel">
              <div className="booking-header">
                <span className="booking-step">
                  01
                </span>

                <div>
                  <p className="booking-eyebrow">
                    Reservation
                  </p>

                  <h1>
                    Book your stay
                  </h1>

                  <p>
                    Complete your details to
                    reserve this room.
                  </p>
                </div>
              </div>

              {error && (
                <div
                  className="booking-alert"
                  role="alert"
                >
                  <span>!</span>
                  <p>{error}</p>
                </div>
              )}

              <form
                className="booking-form"
                onSubmit={handleSubmit}
              >
                <div className="booking-form-section">
                  <div className="booking-section-heading">
                    <span>01</span>

                    <div>
                      <h2>
                        Stay dates
                      </h2>

                      <p>
                        Select when you will
                        arrive and leave.
                      </p>
                    </div>
                  </div>

                  <div className="booking-date-grid">
                    <div className="booking-form-group">
                      <label htmlFor="checkIn">
                        Check-in
                      </label>

                      <input
                        id="checkIn"
                        type="date"
                        value={checkIn}
                        min={
                          new Date()
                            .toISOString()
                            .split('T')[0]
                        }
                        onChange={(event) =>
                          setCheckIn(
                            event.target.value,
                          )
                        }
                        required
                      />
                    </div>

                    <div className="booking-form-group">
                      <label htmlFor="checkOut">
                        Check-out
                      </label>

                      <input
                        id="checkOut"
                        type="date"
                        value={checkOut}
                        min={
                          checkIn ||
                          new Date()
                            .toISOString()
                            .split('T')[0]
                        }
                        onChange={(event) =>
                          setCheckOut(
                            event.target.value,
                          )
                        }
                        required
                      />
                    </div>
                  </div>

                  {nights > 0 && (
                    <div className="booking-night-summary">
                      <span>
                        {nights}{' '}
                        {nights === 1
                          ? 'night'
                          : 'nights'}
                      </span>

                      <strong>
                        {totalAmount.toFixed(2)}
                      </strong>
                    </div>
                  )}

                  <p className="booking-form-note">
                    Room availability will be
                    verified before your
                    reservation is created.
                  </p>
                </div>

                <div className="booking-form-section">
                  <div className="booking-section-heading">
                    <span>02</span>

                    <div>
                      <h2>
                        Guest details
                      </h2>

                      <p>
                        Enter the information
                        required for your stay.
                      </p>
                    </div>
                  </div>

                  <div className="booking-form-grid">
                    <div className="booking-form-group">
                      <label htmlFor="fullName">
                        Full name
                      </label>

                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(event) =>
                          setFullName(
                            event.target.value,
                          )
                        }
                        placeholder="Your full name"
                        autoComplete="name"
                        required
                      />
                    </div>

                    <div className="booking-form-group">
                      <label htmlFor="phone">
                        Phone number
                      </label>

                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(event) =>
                          setPhone(
                            event.target.value,
                          )
                        }
                        placeholder="Phone number"
                        autoComplete="tel"
                        required
                      />
                    </div>

                    <div className="booking-form-group">
                      <label htmlFor="email">
                        Email
                      </label>

                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(
                            event.target.value,
                          )
                        }
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </div>

                    <div className="booking-form-group">
                      <label htmlFor="nationalId">
                        National ID
                      </label>

                      <input
                        id="nationalId"
                        type="text"
                        value={nationalId}
                        onChange={(event) =>
                          setNationalId(
                            event.target.value,
                          )
                        }
                        placeholder="National ID"
                        required
                      />
                    </div>

                    <div className="booking-form-group booking-form-group-full">
                      <label htmlFor="nationality">
                        Nationality
                      </label>

                      <input
                        id="nationality"
                        type="text"
                        value={nationality}
                        onChange={(event) =>
                          setNationality(
                            event.target.value,
                          )
                        }
                        placeholder="Nationality"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="booking-submit-button"
                  disabled={
                    submitting ||
                    checkingAvailability
                  }
                >
                  {checkingAvailability
                    ? 'Checking availability...'
                    : submitting
                      ? 'Creating reservation...'
                      : 'Confirm Reservation'}
                </button>
              </form>
            </section>

            <aside className="booking-summary">
              <div className="booking-summary-image">
                {room.roomType.images?.[0] ? (
                  <img
                    src={
                      room.roomType.images[0]
                    }
                    alt={
                      room.roomType.name
                    }
                  />
                ) : (
                  <div className="booking-summary-image-placeholder">
                    Hotel Room
                  </div>
                )}
              </div>

              <div className="booking-summary-content">
                <span className="booking-summary-status">
                  {room.status}
                </span>

                <h2>
                  Room {room.roomNumber}
                </h2>

                <p>
                  {room.roomType.name}
                </p>

                {room.roomType.description && (
                  <p>
                    {
                      room.roomType
                        .description
                    }
                  </p>
                )}

                <div className="booking-summary-divider" />

                <div className="booking-summary-row">
                  <span>
                    Price per night
                  </span>

                  <strong>
                    {Number(
                      room.roomType.price,
                    ).toFixed(2)}
                  </strong>
                </div>

                <div className="booking-summary-row">
                  <span>Nights</span>

                  <strong>
                    {nights}
                  </strong>
                </div>

                <div className="booking-summary-row booking-summary-total">
                  <span>
                    Estimated total
                  </span>

                  <strong>
                    {totalAmount.toFixed(2)}
                  </strong>
                </div>

                {room.roomType.amenities
                  ?.length > 0 && (
                  <div className="booking-summary-amenities">
                    <h3>
                      Amenities
                    </h3>

                    <div>
                      {room.roomType.amenities.map(
                        (amenity) => (
                          <span
                            key={amenity}
                          >
                            {amenity}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}