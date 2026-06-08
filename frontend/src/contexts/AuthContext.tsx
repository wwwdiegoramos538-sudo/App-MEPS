'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, getUser, getToken, clearAuth, saveAuth } from '@/lib/auth';
import { userApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (!getToken()) {
      setUser(null);
      return;
    }
    try {
      const { data } = await userApi.getProfile();
      setUser(data.user);
      localStorage.setItem('meps_user', JSON.stringify(data.user));
    } catch {
      clearAuth();
      setUser(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      const stored = getUser();
      if (stored && getToken()) {
        setUser(stored);
        await refreshUser();
      }
      setLoading(false);
    };
    init();
  }, []);

  const logout = () => {
    clearAuth();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export { saveAuth };
