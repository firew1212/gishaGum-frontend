
import { apiRequest } from './api';

export type UserRole = 'CUSTOMER' | 'CASHIER' | 'ADMIN';

export interface AuthUser {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  role: UserRole;
}

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  phone: string;
  email?: string;
  nationalId: string;
  nationality: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterResponse {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  role: UserRole;
}

export async function login(
  payload: LoginPayload,
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function register(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getProfile(
  accessToken: string,
): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/profile', {
    method: 'GET',
    token: accessToken,
  });
}

