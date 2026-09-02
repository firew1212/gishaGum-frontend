
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import {
  getRoomById,
  type Room,
} from '@/src/lib/rooms-api';

function getStatusLabel(status: Room['status']) {
  switch (status) {
    case 'AVAILABLE':
      return 'Available';

    case 'OCCUPIED':
      return 'Occupied';

    case 'MAINTENANCE':
      return 'Maintenance';

    case 'OUT_OF_SERVICE':
      return 'Out of service';

    default:
      return status;
  }
}

export default function RoomDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadRoom() {
      try {
        setError('');

        const data = await getRoomById(id);

        setRoom(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Unable to load room details.',
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadRoom();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="room-details-page">
        <div className="room-details-state">
          <p>Loading room...</p>
        </div>
      </main>
    );
  }

  if (error || !room) {
    return (
      <main className="room-details-page">
        <div className="room-details-state">
          <h1>Room not found</h1>

          <p>
            {error ||
              'We could not find this room.'}
          </p>

          <Link
            href="/"
            className="room-details-back"
          >
            ← Back to rooms
          </Link>
        </div>
      </main>
    );
  }

  const { roomType } = room;
  const images = roomType.images;
  const primaryImage = images[0];

  const isBookable =
    room.status === 'AVAILABLE';

  return (
    <main className="room-details-page">
      <div className="room-details-container">
        <Link
          href="/#rooms"
          className="room-details-back"
        >
          ← Back to rooms
        </Link>

        <section className="room-details">
          <div className="room-details-gallery">
            <div className="room-details-image">
              {primaryImage ? (
                <img
                  src={primaryImage}
                  alt={`${roomType.name} room`}
                />
              ) : (
                <div
                  className="room-details-placeholder"
                  aria-hidden="true"
                >
                  <span>Hotel Room</span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="room-details-thumbnails">
                {images.map((roomImage, index) => (
                  <img
                    key={roomImage}
                    src={roomImage}
                    alt={`${roomType.name} room view ${index + 1}`}
                    loading="lazy"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="room-details-content">
            <div className="room-details-heading">
              <p className="eyebrow">
                {roomType.name}
              </p>

              <h1>
                Room {room.roomNumber}
              </h1>
            </div>

            <div className="room-details-status">
              <span
                className={`room-status room-status-${room.status.toLowerCase()}`}
              >
                {getStatusLabel(room.status)}
              </span>
            </div>

            {roomType.description && (
              <p className="room-details-description">
                {roomType.description}
              </p>
            )}

            <div className="room-details-price">
              <strong>
                {roomType.price} ETB
              </strong>

              <span>per night</span>
            </div>

            <div className="room-details-info">
              <div>
                <span>Room</span>
                <strong>
                  {room.roomNumber}
                </strong>
              </div>

              <div>
                <span>Floor</span>
                <strong>
                  {room.floor}
                </strong>
              </div>

              <div>
                <span>Room type</span>
                <strong>
                  {roomType.name}
                </strong>
              </div>
            </div>

            {roomType.amenities.length > 0 && (
              <div className="room-details-amenities">
                <h2>Amenities</h2>

                <div className="amenities-list">
                  {roomType.amenities.map(
                    (amenity) => (
                      <span key={amenity}>
                        {amenity}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}

            <div className="room-details-actions">
              {isBookable ? (
                <Link
                  href={`/rooms/${room.id}/book`}
                  className="room-book-button"
                >
                  Book this room
                  <span aria-hidden="true">
                    →
                  </span>
                </Link>
              ) : (
                <div className="room-not-bookable">
                  This room is currently unavailable
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

