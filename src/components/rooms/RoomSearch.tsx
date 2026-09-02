
'use client';

import {
  FormEvent,
  useState,
} from 'react';

import {
  checkRoomAvailability,
  type Room,
} from '@/src/lib/rooms-api';

interface RoomSearchProps {
  onResults: (rooms: Room[]) => void;
  onLoading: (loading: boolean) => void;
  onError: (message: string) => void;
}

export default function RoomSearch({
  onResults,
  onLoading,
  onError,
}: RoomSearchProps) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [searching, setSearching] = useState(false);

  const today = new Date()
    .toISOString()
    .split('T')[0];

  function handleCheckInChange(
    value: string,
  ) {
    setCheckIn(value);

    // Reset checkout if it is no longer valid.
    if (checkOut && value >= checkOut) {
      setCheckOut('');
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    onError('');

    if (!checkIn || !checkOut) {
      onError(
        'Please select your check-in and check-out dates.',
      );
      return;
    }

    if (checkOut <= checkIn) {
      onError(
        'Check-out date must be after check-in date.',
      );
      return;
    }

    setSearching(true);
    onLoading(true);

    try {
      const rooms =
        await checkRoomAvailability({
          checkIn,
          checkOut,
        });

      onResults(rooms);
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : 'Unable to check room availability.',
      );
    } finally {
      setSearching(false);
      onLoading(false);
    }
  }

  return (
    <form
      className="room-search"
      onSubmit={handleSubmit}
      aria-label="Search for available hotel rooms"
    >
      <div className="search-field">
        <label htmlFor="check-in">
          Check-in
        </label>

        <input
          id="check-in"
          type="date"
          value={checkIn}
          min={today}
          onChange={(event) =>
            handleCheckInChange(
              event.target.value,
            )
          }
          required
        />
      </div>

      <div className="search-field">
        <label htmlFor="check-out">
          Check-out
        </label>

        <input
          id="check-out"
          type="date"
          value={checkOut}
          min={checkIn || today}
          onChange={(event) =>
            setCheckOut(event.target.value)
          }
          required
        />
      </div>

      <button
        type="submit"
        className="search-button"
        disabled={searching}
      >
        {searching
          ? 'Checking availability...'
          : 'Search rooms'}
      </button>
    </form>
  );
}

