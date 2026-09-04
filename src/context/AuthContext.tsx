'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type { AuthUser } from '@/src/lib/auth';

import {
  clearAuth,
  getCurrentUser,
  saveAuth,
} from '@/src/lib/auth-storage';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (
    accessToken: string,
    user: AuthUser,
  ) => void;
  logout: () => void;
}

const AuthContext =
  createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreAuthentication = () => {
      try {
        const currentUser = getCurrentUser();

        setUser(currentUser);
      } catch (error) {
        console.error(
          'Failed to restore authentication:',
          error,
        );

        clearAuth();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreAuthentication();
  }, []);

  const login = (
    accessToken: string,
    authenticatedUser: AuthUser,
  ): void => {
    saveAuth(
      accessToken,
      authenticatedUser,
    );

    setUser(authenticatedUser);
  };

  const logout = (): void => {
    clearAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error(
      'useAuth must be used within an AuthProvider.',
    );
  }

  return context;
}