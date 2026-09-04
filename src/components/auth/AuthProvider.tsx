'use client';

import {
createContext,
useCallback,
useContext,
useEffect,
useMemo,
useState,
type ReactNode,
} from 'react';

import {
getProfile,
login as loginRequest,
register as registerRequest,
type AuthUser,
type LoginPayload,
type RegisterPayload,
} from '@/src/lib/auth';

const ACCESS_TOKEN_KEY = 'hotel_booking_access_token';

interface AuthContextValue {
user: AuthUser | null;
accessToken: string | null;
isAuthenticated: boolean;
isLoading: boolean;
login: (payload: LoginPayload) => Promise<AuthUser>;
register: (payload: RegisterPayload) => Promise<void>;
logout: () => void;
refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(
undefined,
);

interface AuthProviderProps {
children: ReactNode;
}

export default function AuthProvider({
children,
}: AuthProviderProps) {
const [user, setUser] = useState<AuthUser | null>(null);
const [accessToken, setAccessToken] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(true);

const logout = useCallback(() => {
localStorage.removeItem(ACCESS_TOKEN_KEY);
setAccessToken(null);
setUser(null);
}, []);

const refreshUser = useCallback(async () => {
const token = localStorage.getItem(ACCESS_TOKEN_KEY);


if (!token) {
  setAccessToken(null);
  setUser(null);
  return;
}

try {
  const profile = await getProfile(token);

  setAccessToken(token);
  setUser(profile);
} catch {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  setAccessToken(null);
  setUser(null);
}


}, []);

useEffect(() => {
let mounted = true;


async function initializeAuth() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (!token) {
    if (mounted) {
      setIsLoading(false);
    }

    return;
  }

  try {
    const profile = await getProfile(token);

    if (mounted) {
      setAccessToken(token);
      setUser(profile);
    }
  } catch {
    localStorage.removeItem(ACCESS_TOKEN_KEY);

    if (mounted) {
      setAccessToken(null);
      setUser(null);
    }
  } finally {
    if (mounted) {
      setIsLoading(false);
    }
  }
}

initializeAuth();

return () => {
  mounted = false;
};


}, []);

const login = useCallback(
async (payload: LoginPayload) => {
const response = await loginRequest(payload);


  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    response.accessToken,
  );

  setAccessToken(response.accessToken);
  setUser(response.user);

  return response.user;
},
[],


);

const register = useCallback(
async (payload: RegisterPayload) => {
await registerRequest(payload);
},
[],
);

const value = useMemo<AuthContextValue>(
() => ({
user,
accessToken,
isAuthenticated: Boolean(user && accessToken),
isLoading,
login,
register,
logout,
refreshUser,
}),
[
user,
accessToken,
isLoading,
login,
register,
logout,
refreshUser,
],
);

return (
<AuthContext.Provider value={value}>
{children}
</AuthContext.Provider>
);
}

export function useAuth(): AuthContextValue {
const context = useContext(AuthContext);

if (!context) {
throw new Error(
'useAuth must be used inside an AuthProvider.',
);
}

return context;
}
