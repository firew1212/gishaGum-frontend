import { apiRequest } from './api';

export type RoomStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'MAINTENANCE'
  | 'OUT_OF_SERVICE';

export interface RoomType {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
  amenities: string[];
  images: string[];
  rooms?: Room[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  status: RoomStatus;
  roomTypeId: string;
  roomType: RoomType;
  createdAt?: string;
  updatedAt?: string;
}

export interface AvailabilityParams {
  checkIn: string;
  checkOut: string;
  roomTypeId?: string;
}

export async function getRooms(): Promise<Room[]> {
  return apiRequest<Room[]>('/rooms', {
    method: 'GET',
  });
}

export async function getRoom(id: string): Promise<Room> {
  return apiRequest<Room>(`/rooms/${id}`, {
    method: 'GET',
  });
}

export async function getRoomTypes(): Promise<RoomType[]> {
  return apiRequest<RoomType[]>('/room-types', {
    method: 'GET',
  });
}

export async function getRoomType(id: string): Promise<RoomType> {
  return apiRequest<RoomType>(`/room-types/${id}`, {
    method: 'GET',
  });
}

export async function checkRoomAvailability(
  params: AvailabilityParams,
): Promise<Room[]> {
  const searchParams = new URLSearchParams({
    checkIn: params.checkIn,
    checkOut: params.checkOut,
  });

  if (params.roomTypeId) {
    searchParams.set('roomTypeId', params.roomTypeId);
  }

  return apiRequest<Room[]>(
    `/availability?${searchParams.toString()}`,
    {
      method: 'GET',
    },
  );
}