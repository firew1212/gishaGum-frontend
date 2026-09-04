'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from '@/src/components/auth/AuthProvider';
import {
getRoom,
type Room,
} from '@/src/lib/rooms-api';
import {
formatPrice,
getRoomStatusClass,
getRoomStatusLabel,
isRoomBookable,
} from '@/src/lib/room-utils';

export default function RoomDetailsPage() {
const params = useParams<{
id: string;
}>();

const { user } = useAuth();

const [room, setRoom] =
useState<Room | null>(null);

const [loading, setLoading] =
useState(true);

const [error, setError] =
useState('');

const [selectedImage, setSelectedImage] =
useState(0);

useEffect(() => {
let mounted = true;


async function loadRoom() {
  try {
    setLoading(true);
    setError('');

    const data = await getRoom(
      params.id,
    );

    if (mounted) {
      setRoom(data);
    }
  } catch (error) {
    if (mounted) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to load this room.',
      );
    }
  } finally {
    if (mounted) {
      setLoading(false);
    }
  }
}

if (params.id) {
  loadRoom();
}

return () => {
  mounted = false;
};


}, [params.id]);

if (loading) {
return ( <section className="section"> <div className="loading"> <div className="flex flex-col items-center gap-3"> <span
           className="spinner"
           aria-hidden="true"
         /> <p className="text-sm text-muted">
Loading room details... </p> </div> </div> </section>
);
}

if (error || !room) {
return ( <section className="section">
<div
className="container"
style={{ maxWidth: 760 }}
> <div
         className="rooms-alert"
         role="alert"
       > <strong>
We couldn't load this room. </strong>


        <p>
          {error ||
            'The requested room could not be found.'}
        </p>

        <Link
          href="/rooms"
          className="btn btn-secondary"
          style={{
            marginTop: 18,
          }}
        >
          Back to rooms
        </Link>
      </div>
    </div>
  </section>
);


}

const images = room.roomType.images.filter(
(image) =>
typeof image === 'string' &&
image.trim().length > 0,
);

const bookable =
isRoomBookable(room);

return ( <section className="section"> <div className="container"> <Link
       href="/rooms"
       className="room-back-link"
     >
← Back to rooms </Link>


    <div className="room-details">
      <div className="room-details-gallery">
        <div className="room-details-main-image">
          {images.length > 0 ? (
            <img
              src={images[selectedImage]}
              alt={`${room.roomType.name} room`}
            />
          ) : (
            <div className="room-details-placeholder">
              <span aria-hidden="true">
                🏨
              </span>
              <span>
                No image available
              </span>
            </div>
          )}

          <span
            className={`room-status room-details-status ${getRoomStatusClass(
              room.status,
            )}`}
          >
            {getRoomStatusLabel(
              room.status,
            )}
          </span>
        </div>

        {images.length > 1 && (
          <div className="room-image-thumbnails">
            {images.map(
              (image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className={`room-thumbnail ${
                    selectedImage === index
                      ? 'room-thumbnail-active'
                      : ''
                  }`}
                  onClick={() =>
                    setSelectedImage(
                      index,
                    )
                  }
                  aria-label={`View room image ${index + 1}`}
                  aria-pressed={
                    selectedImage ===
                    index
                  }
                >
                  <img
                    src={image}
                    alt=""
                  />
                </button>
              ),
            )}
          </div>
        )}
      </div>

      <div className="room-details-content">
        <p className="room-card-eyebrow">
          Room {room.roomNumber} · Floor{' '}
          {room.floor}
        </p>

        <h1 className="heading-lg">
          {room.roomType.name}
        </h1>

        <div className="room-details-price">
          <strong>
            {formatPrice(
              room.roomType.price,
            )}
          </strong>

          <span>
            per night
          </span>
        </div>

        {room.roomType.description && (
          <p className="room-details-description">
            {room.roomType.description}
          </p>
        )}

        {room.roomType.amenities.length >
          0 && (
          <div className="room-details-section">
            <h2 className="heading-md">
              Room amenities
            </h2>

            <div className="room-amenities-list">
              {room.roomType.amenities.map(
                (amenity) => (
                  <div
                    key={amenity}
                    className="room-amenity-large"
                  >
                    <span
                      className="amenity-check"
                      aria-hidden="true"
                    >
                      ✓
                    </span>

                    <span>
                      {amenity}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        <div className="room-booking-panel">
          <div>
            <strong>
              Ready to book?
            </strong>

            <p>
              Select your dates during the
              booking process.
            </p>
          </div>

          {bookable ? (
            user ? (
              <Link
                href={`/rooms/${room.id}/book`}
                className="btn btn-primary btn-lg"
              >
                Book this room
              </Link>
            ) : (
              <Link
                href={`/login?redirect=/rooms/${room.id}`}
                className="btn btn-primary btn-lg"
              >
                Sign in to book
              </Link>
            )
          ) : (
            <span className="room-unavailable-button">
              Currently unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
</section>


);
}
