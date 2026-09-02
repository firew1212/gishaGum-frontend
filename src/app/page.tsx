'use client';

import { useEffect, useState } from 'react';

import RoomGrid from '@/src/components/rooms/RoomGrid';
import RoomSearch from '@/src/components/rooms/RoomSearch';

import {
  getRooms,
  type Room,
} from '@/src/lib/rooms-api';

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [searching, setSearching] =
    useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] =
    useState(false);

  useEffect(() => {
    async function loadRooms() {
      try {
        const data = await getRooms();

        setRooms(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Unable to load rooms.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadRooms();
  }, []);

  function handleResults(
    availableRooms: Room[],
  ) {
    setRooms(availableRooms);
    setHasSearched(true);
  }

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <p className="eyebrow">
            Welcome to our hotel
          </p>

          <h1>
            Your stay,
            <br />
            beautifully simple.
          </h1>

          <p className="home-hero-description">
            Discover comfortable rooms, thoughtful
            amenities, and a stay designed around you.
          </p>
        </div>

        <RoomSearch
          onResults={handleResults}
          onLoading={setSearching}
          onError={setError}
        />
      </section>

      <section
        id="rooms"
        className="rooms-section"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              Accommodation
            </p>

            <h2>
              {hasSearched
                ? 'Available rooms'
                : 'Find your perfect room'}
            </h2>
          </div>

          <p>
            {hasSearched
              ? 'Rooms available for your selected dates.'
              : 'Choose from our comfortable rooms and find the right space for your stay.'}
          </p>
        </div>

        {searching && (
          <div className="rooms-loading">
            <p>
              Checking room availability...
            </p>
          </div>
        )}

        {!searching && error && (
          <div className="rooms-error">
            <p>{error}</p>
          </div>
        )}

        {!loading &&
          !searching &&
          !error && (
            <RoomGrid rooms={rooms} />
          )}

        {loading && (
          <div className="rooms-loading">
            <p>Loading rooms...</p>
          </div>
        )}
      </section>
    </main>
  );
}