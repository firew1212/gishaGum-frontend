import { apiRequest } from './api';

export interface RegisterRequest {
  fullName: string;
  phone: string;
  email?: string;
  nationalId: string;
  nationality: string;
  password: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  role: 'CUSTOMER' | 'CASHIER' | 'ADMIN';
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export async function registerUser(
  data: RegisterRequest,
) {
  return apiRequest<AuthUser>(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
}

export async function loginUser(
  data: LoginRequest,
) {
  return apiRequest<LoginResponse>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
}