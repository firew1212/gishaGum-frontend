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

function handleCheckInChange(value: string) {
setCheckIn(value);


if (checkOut && value >= checkOut) {
  setCheckOut('');
}

onError('');


}

function handleCheckOutChange(value: string) {
setCheckOut(value);
onError('');
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
      : 'Unable to check room availability. Please try again.',
  );
} finally {
  setSearching(false);
  onLoading(false);
}


}

return ( <div className="search-panel"> <form
     className="search-grid"
     onSubmit={handleSubmit}
     aria-label="Search for available hotel rooms"
   > <div className="search-field"> <label
         htmlFor="check-in"
         className="search-field-label"
       >
Check-in </label>


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
        disabled={searching}
        required
      />
    </div>

    <div className="search-field">
      <label
        htmlFor="check-out"
        className="search-field-label"
      >
        Check-out
      </label>

      <input
        id="check-out"
        type="date"
        value={checkOut}
        min={checkIn || today}
        onChange={(event) =>
          handleCheckOutChange(
            event.target.value,
          )
        }
        disabled={searching}
        required
      />
    </div>

    <div className="search-field search-summary">
      <span className="search-field-label">
        Stay
      </span>

      <span className="search-field-value">
        {checkIn && checkOut
          ? 'Dates selected'
          : 'Select your dates'}
      </span>
    </div>

    <button
      type="submit"
      className="btn btn-primary btn-lg"
      disabled={searching}
    >
      {searching ? (
        <>
          <span
            className="spinner spinner-sm"
            aria-hidden="true"
          />
          Checking...
        </>
      ) : (
        <>
          Search rooms
          <span aria-hidden="true">
            →
          </span>
        </>
      )}
    </button>
  </form>
</div>


);
}
