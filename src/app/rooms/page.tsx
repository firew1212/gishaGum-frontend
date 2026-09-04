'use client';

import { useEffect, useState } from 'react';

import RoomAvailabilitySearch from '@/src/components/rooms/RoomAvailabilitySearch';
import RoomGrid from '@/src/components/rooms/RoomGrid';
import {
getRooms,
type Room,
} from '@/src/lib/rooms-api';

export default function RoomsPage() {
const [rooms, setRooms] = useState<Room[]>([]);
const [loading, setLoading] =
useState(true);
const [searching, setSearching] =
useState(false);
const [error, setError] =
useState('');
const [hasSearched, setHasSearched] =
useState(false);

useEffect(() => {
let mounted = true;


async function loadRooms() {
  try {
    setLoading(true);
    setError('');

    const data = await getRooms();

    if (mounted) {
      setRooms(data);
    }
  } catch (error) {
    if (mounted) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to load rooms.',
      );
    }
  } finally {
    if (mounted) {
      setLoading(false);
    }
  }
}

loadRooms();

return () => {
  mounted = false;
};


}, []);

function handleResults(
availableRooms: Room[],
searched: boolean,
) {
setRooms(availableRooms);
setHasSearched(searched);
setError('');
}

function handleLoading(
value: boolean,
) {
setSearching(value);
}

function handleError(
message: string,
) {
setError(message);
}

const busy =
loading || searching;

return (
<> <section className="rooms-hero"> <div className="container"> <div className="rooms-hero-content fade-up"> <span className="badge badge-primary">
Accommodation </span>

```
        <h1
          className="heading-xl"
          style={{ marginTop: 18 }}
        >
          Find the right room
          <br />
          for your stay.
        </h1>

        <p
          className="text-lead"
          style={{
            maxWidth: 680,
            marginTop: 22,
          }}
        >
          Explore our rooms and check real-time
          availability for your preferred dates.
        </p>
      </div>
    </div>
  </section>

  <RoomAvailabilitySearch
    onResults={handleResults}
    onLoading={handleLoading}
    onError={handleError}
  />

  <section className="section">
    <div className="container">
      <div className="rooms-section-heading">
        <div>
          <p className="text-primary">
            {hasSearched
              ? 'Availability results'
              : 'Our accommodation'}
          </p>

          <h2 className="heading-lg">
            {hasSearched
              ? 'Available rooms'
              : 'Choose your room'}
          </h2>

          <p className="text-muted">
            {hasSearched
              ? 'These rooms are available for the dates you selected.'
              : 'Comfortable spaces designed for a pleasant hotel stay.'}
          </p>
        </div>

        {!busy &&
          !error &&
          rooms.length > 0 && (
            <span className="room-result-count">
              {rooms.length}{' '}
              {rooms.length === 1
                ? 'room'
                : 'rooms'}
            </span>
          )}
      </div>

      {busy && (
        <div
          className="rooms-loading"
          aria-live="polite"
        >
          <span
            className="spinner"
            aria-hidden="true"
          />

          <p>
            {searching
              ? 'Checking availability...'
              : 'Loading rooms...'}
          </p>
        </div>
      )}

      {!busy && error && (
        <div
          className="rooms-alert"
          role="alert"
        >
          <strong>
            We couldn't complete your request.
          </strong>

          <p>{error}</p>
        </div>
      )}

      {!busy &&
        !error &&
        rooms.length > 0 && (
          <RoomGrid rooms={rooms} />
        )}

      {!busy &&
        !error &&
        rooms.length === 0 && (
          <div className="rooms-empty">
            <div className="rooms-empty-icon">
              <span aria-hidden="true">
                🛏
              </span>
            </div>

            <h3>
              {hasSearched
                ? 'No rooms available'
                : 'No rooms found'}
            </h3>

            <p>
              {hasSearched
                ? 'Try different dates or select another room type.'
                : 'There are currently no rooms available to display.'}
            </p>
          </div>
        )}
    </div>
  </section>
</>


);
}
