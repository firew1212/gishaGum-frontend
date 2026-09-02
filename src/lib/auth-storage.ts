import type { AuthUser } from './auth-api';

const TOKEN_KEY = 'hotel_access_token';
const USER_KEY = 'hotel_user';

export function saveAuth(
  accessToken: string,
  user: AuthUser,
) {
  localStorage.setItem(
    TOKEN_KEY,
    accessToken,
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user),
  );
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): AuthUser | null {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}