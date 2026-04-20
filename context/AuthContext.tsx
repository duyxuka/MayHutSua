'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as authLib from '@/lib/auth';
import { getProfile } from '@/lib/api';

interface AuthContextType {
  user: any | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  saveTokens: (access: string, refresh?: string) => void;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLib.isLoggedIn()) {
      getProfile()
        .then(res => setUser(res))
        .catch(() => setUser(null))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  function saveTokens(access: string, refresh?: string) {
    authLib.saveTokens(access, refresh);
    getProfile().then(setUser).catch(() => setUser(null));
  }

  function logout() {
    authLib.logout();
    setUser(null);
    window.location.href = '/dang-nhap';
  }

  function refreshUser() {
    if (!authLib.isLoggedIn()) return;
    getProfile().then(setUser).catch(() => setUser(null));
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, isLoading, saveTokens, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}