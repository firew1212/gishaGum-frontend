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