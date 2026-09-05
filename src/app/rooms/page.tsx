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
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

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

  function handleLoading(value: boolean) {
    setSearching(value);
  }

  function handleError(message: string) {
    setError(message);
  }

  const busy = loading || searching;

  return (
    <>
      {/* =====================================================
          ROOMS HERO
          ===================================================== */}
      <section className="rooms-hero">
        {/* Ready-to-fill background image area */}
        <div
          className="rooms-hero-background"
          aria-hidden="true"
        >
          <div className="rooms-hero-image" />
          <div className="rooms-hero-overlay" />
          <div className="rooms-hero-glow rooms-hero-glow-one" />
          <div className="rooms-hero-glow rooms-hero-glow-two" />
        </div>

        <div className="container">
          <div className="rooms-hero-content fade-up">
            <span className="badge rooms-hero-badge">
              Accommodation
            </span>

            <h1 className="rooms-hero-title">
              Find the right room
              <br />
              for your stay.
            </h1>

            <p className="rooms-hero-description">
              Explore comfortable rooms and check real-time
              availability for your preferred dates.
            </p>

            <div className="rooms-hero-highlights">
              <div className="rooms-hero-highlight">
                <span>✓</span>
                <p>Comfortable rooms</p>
              </div>

              <div className="rooms-hero-highlight">
                <span>✓</span>
                <p>Real-time availability</p>
              </div>

              <div className="rooms-hero-highlight">
                <span>✓</span>
                <p>Simple booking</p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="rooms-hero-scroll"
          aria-hidden="true"
        >
          <span />
        </div>
      </section>

      {/* =====================================================
          AVAILABILITY SEARCH
          ===================================================== */}
      <section className="rooms-search-section">
        <div className="container">
          <div className="rooms-search-card">
            <div className="rooms-search-heading">
              <span className="badge badge-primary">
                Search availability
              </span>

              <h2 className="heading-md">
                When would you like to stay?
              </h2>

              <p className="text-muted">
                Select your dates to see rooms available
                for your stay.
              </p>
            </div>

            <RoomAvailabilitySearch
              onResults={handleResults}
              onLoading={handleLoading}
              onError={handleError}
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          ROOMS
          ===================================================== */}
      <section className="section rooms-results-section">
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

          {/* Loading */}
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

          {/* Error */}
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

          {/* Results */}
          {!busy &&
            !error &&
            rooms.length > 0 && (
              <RoomGrid rooms={rooms} />
            )}

          {/* Empty */}
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

      {/* =====================================================
          BOTTOM CTA
          ===================================================== */}
      <section className="rooms-bottom-cta">
        <div className="container">
          <div className="rooms-bottom-cta-card">
            <div>
              <span className="badge badge-primary">
                Your stay starts here
              </span>

              <h2 className="heading-lg">
                Find a room that feels like home.
              </h2>

              <p className="text-muted">
                Explore our accommodation and choose
                the room that fits your stay.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}