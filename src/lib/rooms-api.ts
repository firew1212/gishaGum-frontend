import { apiRequest } from './api';

export interface RoomType {
  id: string;
  name: string;
  description: string | null;
  price: string;
  amenities: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export type RoomStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'MAINTENANCE'
  | 'OUT_OF_SERVICE';

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  status: RoomStatus;
  roomTypeId: string;
  createdAt: string;
  updatedAt: string;
  roomType: RoomType;
}

export interface CheckAvailabilityParams {
  checkIn: string;
  checkOut: string;
  roomTypeId?: string;
}

export async function getRooms(): Promise<Room[]> {
  return apiRequest<Room[]>('/rooms');
}

export async function getRoomById(
  id: string,
): Promise<Room> {
  return apiRequest<Room>(`/rooms/${id}`);
}

export async function checkRoomAvailability(
  params: CheckAvailabilityParams,
): Promise<Room[]> {
  const searchParams = new URLSearchParams({
    checkIn: params.checkIn,
    checkOut: params.checkOut,
  });

  if (params.roomTypeId) {
    searchParams.set(
      'roomTypeId',
      params.roomTypeId,
    );
  }

  return apiRequest<Room[]>(
    `/availability?${searchParams.toString()}`,
  );
}

export async function getRoomTypes(): Promise<RoomType[]> {
  return apiRequest<RoomType[]>('/room-types');
}