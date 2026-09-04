import type { AuthUser } from './auth';

const TOKEN_KEY = 'hotel_access_token';
const USER_KEY = 'hotel_user';

export function saveAuth(
  accessToken: string,
  user: AuthUser,
): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user),
  );
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): AuthUser | null {
  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    clearAuth();
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}