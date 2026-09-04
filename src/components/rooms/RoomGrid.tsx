import type { Room } from '@/src/lib/rooms-api';

import RoomCard from './RoomCard';

interface RoomGridProps {
rooms: Room[];
}

export default function RoomGrid({
rooms,
}: RoomGridProps) {
if (rooms.length === 0) {
return null;
}

return ( <div className="rooms-grid">
{rooms.map((room) => ( <RoomCard
       key={room.id}
       room={room}
     />
))} </div>
);
}
