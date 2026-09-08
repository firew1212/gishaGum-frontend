import { apiRequest } from './api';

import type {
  Room,
  RoomStatus,
  RoomType,
} from './rooms-api';

export type { Room, RoomStatus, RoomType };

export interface CreateRoomPayload {
  roomNumber: string;
  floor: number;
  roomTypeId: string;
}

export interface UpdateRoomPayload {
  roomNumber?: string;
  floor?: number;
  roomTypeId?: string;
  status?: RoomStatus;
}

export async function getAdminRooms(): Promise<Room[]> {
  return apiRequest<Room[]>('/rooms', {
    method: 'GET',
  });
}

export async function createRoom(
  payload: CreateRoomPayload,
  accessToken: string,
): Promise<Room> {
  return apiRequest<Room>('/rooms', {
    method: 'POST',
    token: accessToken,
    body: JSON.stringify(payload),
  });
}

export async function updateRoom(
  roomId: string,
  payload: UpdateRoomPayload,
  accessToken: string,
): Promise<Room> {
  return apiRequest<Room>(`/rooms/${roomId}`, {
    method: 'PATCH',
    token: accessToken,
    body: JSON.stringify(payload),
  });
}

export async function deleteRoom(
  roomId: string,
  accessToken: string,
): Promise<void> {
  await apiRequest<unknown>(`/rooms/${roomId}`, {
    method: 'DELETE',
    token: accessToken,
  });
}

export async function getAdminRoomTypes(): Promise<RoomType[]> {
  return apiRequest<RoomType[]>('/room-types', {
    method: 'GET',
  });
}

export interface CreateRoomTypePayload {
  name: string;
  description?: string;
  price: number;
  amenities: string[];
  images: string[];
}

export type UpdateRoomTypePayload = Partial<CreateRoomTypePayload>;

export async function createRoomType(
  payload: CreateRoomTypePayload,
  accessToken: string,
): Promise<RoomType> {
  return apiRequest<RoomType>('/room-types', {
    method: 'POST',
    token: accessToken,
    body: JSON.stringify(payload),
  });
}

export async function updateRoomType(
  roomTypeId: string,
  payload: UpdateRoomTypePayload,
  accessToken: string,
): Promise<RoomType> {
  return apiRequest<RoomType>(`/room-types/${roomTypeId}`, {
    method: 'PATCH',
    token: accessToken,
    body: JSON.stringify(payload),
  });
}

export async function deleteRoomType(
  roomTypeId: string,
  accessToken: string,
): Promise<void> {
  await apiRequest<unknown>(`/room-types/${roomTypeId}`, {
    method: 'DELETE',
    token: accessToken,
  });
}