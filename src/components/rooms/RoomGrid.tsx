
import type { Room } from '@/src/lib/rooms-api';

import RoomCard from './RoomCard';

interface RoomGridProps {
  rooms: Room[];
}

export default function RoomGrid({
  rooms,
}: RoomGridProps) {
  if (rooms.length === 0) {
    return (
      <div className="rooms-empty">
        <div className="rooms-empty-icon" aria-hidden="true">
          <span>⌂</span>
        </div>

        <h3>No rooms available</h3>

        <p>
          We couldn't find any rooms matching your
          current search. Try different dates.
        </p>
      </div>
    );
  }

  return (
    <div className="room-grid">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
        />
      ))}
    </div>
  );
}

