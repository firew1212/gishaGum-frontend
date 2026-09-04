
import type {
  Room,
  RoomStatus,
} from './rooms-api';

export function formatPrice(
  price: number | string,
): string {
  const numericPrice =
    typeof price === 'string'
      ? Number(price)
      : price;

  if (!Number.isFinite(numericPrice)) {
    return 'Price unavailable';
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericPrice);
}

export function getRoomStatusLabel(
  status: RoomStatus,
): string {
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

export function getRoomStatusClass(
  status: RoomStatus,
): string {
  switch (status) {
    case 'AVAILABLE':
      return 'room-status-available';

    case 'OCCUPIED':
      return 'room-status-occupied';

    case 'MAINTENANCE':
      return 'room-status-maintenance';

    case 'OUT_OF_SERVICE':
      return 'room-status-out-of-service';

    default:
      return '';
  }
}

export function isRoomBookable(
  room: Room,
): boolean {
  return room.status === 'AVAILABLE';
}

export function getRoomImage(
  images: string[],
): string | null {
  const validImage = images.find(
    (image) =>
      typeof image === 'string' &&
      image.trim().length > 0,
  );

  return validImage?.trim() ?? null;
}

