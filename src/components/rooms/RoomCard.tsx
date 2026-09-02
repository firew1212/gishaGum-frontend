
'use client';

import Link from 'next/link';

import type { Room } from '@/src/lib/rooms-api';

interface RoomCardProps {
  room: Room;
}

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

export default function RoomCard({
  room,
}: RoomCardProps) {
  const {
    roomNumber,
    floor,
    status,
    roomType,
  } = room;

  const image = roomType.images[0];

  return (
    <article className="room-card">
      <div className="room-card-image">
        {image ? (
          <img
            src={image}
            alt={`${roomType.name} room`}
            loading="lazy"
          />
        ) : (
          <div
            className="room-card-placeholder"
            aria-hidden="true"
          >
            <span>Hotel Room</span>
          </div>
        )}

        <span
          className={`room-status room-status-${status.toLowerCase()}`}
        >
          {getStatusLabel(status)}
        </span>
      </div>

      <div className="room-card-content">
        <div className="room-card-header">
          <div>
            <p className="room-card-type">
              {roomType.name}
            </p>

            <h3>
              Room {roomNumber}
            </h3>
          </div>

          <div className="room-card-price">
            <strong>
              {roomType.price} ETB
            </strong>
            <span>per night</span>
          </div>
        </div>

        {roomType.description && (
          <p className="room-card-description">
            {roomType.description}
          </p>
        )}

        <div className="room-card-meta">
          <span>Floor {floor}</span>
          <span
            className="room-card-divider"
            aria-hidden="true"
          >
            •
          </span>
          <span>
            {roomType.amenities.length} amenities
          </span>
        </div>

        {roomType.amenities.length > 0 && (
          <div
            className="room-card-amenities"
            aria-label="Room amenities"
          >
            {roomType.amenities
              .slice(0, 3)
              .map((amenity) => (
                <span key={amenity}>
                  {amenity}
                </span>
              ))}

            {roomType.amenities.length > 3 && (
              <span>
                +{roomType.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        <Link
          href={`/rooms/${room.id}`}
          className="room-card-button"
        >
          View room
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
