
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type { AuthUser } from '@/src/lib/auth-api';

import {
  clearAuth,
  getCurrentUser,
  saveAuth,
} from '@/src/lib/auth-storage';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (
    accessToken: string,
    user: AuthUser,
  ) => void;
  logout: () => void;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined,
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    try {
      const currentUser =
        getCurrentUser();

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
  }, []);

  function login(
    accessToken: string,
    user: AuthUser,
  ) {
    saveAuth(
      accessToken,
      user,
    );

    setUser(user);
  }

  function logout() {
    clearAuth();
    setUser(null);
  }

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

export function useAuth(): AuthContextType {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    );
  }

  return context;
}
