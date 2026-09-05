'use client';

import Link from 'next/link';

import type { Room } from '@/src/lib/rooms-api';
import {
  formatPrice,
  getRoomImage,
  getRoomStatusClass,
  getRoomStatusLabel,
  isRoomBookable,
} from '@/src/lib/room-utils';

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({
  room,
}: RoomCardProps) {
  const image = getRoomImage(
    room.roomType.images,
  );

  const bookable = isRoomBookable(room);

  return (
    <article className="room-card">
      {/* Image */}
      <Link
        href={`/rooms/${room.id}`}
        className="room-card-image-link"
        aria-label={`View ${room.roomType.name}, room ${room.roomNumber}`}
      >
        <div className="room-card-image">
          {image ? (
            <img
              src={image}
              alt={`${room.roomType.name} room`}
              loading="lazy"
            />
          ) : (
            <div
              className="room-image-placeholder"
              aria-label="No room image available"
            >
              <span
                className="room-placeholder-icon"
                aria-hidden="true"
              >
                🏨
              </span>

              <span>No image available</span>
            </div>
          )}

          <div className="room-card-image-overlay" />

          <span
            className={`room-status ${getRoomStatusClass(
              room.status,
            )}`}
          >
            {getRoomStatusLabel(room.status)}
          </span>

          <span className="room-card-image-action">
            View room →
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="room-card-content">
        <div className="room-card-heading">
          <div className="room-card-heading-main">
            <p className="room-card-eyebrow">
              Room {room.roomNumber}
              <span className="room-card-dot">•</span>
              Floor {room.floor}
            </p>

            <h2 className="room-card-title">
              {room.roomType.name}
            </h2>
          </div>

          <div className="room-card-price">
            <strong>
              {formatPrice(room.roomType.price)}
            </strong>

            <span>/ night</span>
          </div>
        </div>

        {room.roomType.description && (
          <p className="room-card-description">
            {room.roomType.description}
          </p>
        )}

        {room.roomType.amenities.length > 0 && (
          <div
            className="room-card-amenities"
            aria-label="Room amenities"
          >
            {room.roomType.amenities
              .slice(0, 4)
              .map((amenity) => (
                <span
                  key={amenity}
                  className="room-amenity"
                >
                  <span
                    className="room-amenity-check"
                    aria-hidden="true"
                  >
                    ✓
                  </span>

                  {amenity}
                </span>
              ))}

            {room.roomType.amenities.length > 4 && (
              <span className="room-amenity-more">
                +{room.roomType.amenities.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="room-card-footer">
          <Link
            href={`/rooms/${room.id}`}
            className="btn btn-secondary room-card-details-button"
          >
            View details
          </Link>

          {bookable ? (
            <Link
              href={`/rooms/${room.id}`}
              className="btn btn-primary room-card-book-button"
            >
              Book this room
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <span className="room-unavailable-text">
              Not currently bookable
            </span>
          )}
        </div>
      </div>
    </article>
  );
}