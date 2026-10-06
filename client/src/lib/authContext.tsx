import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser, UserRole } from '../types';
import { api } from './api';

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  loginAs: (email: string, role?: UserRole, name?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginAs: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('sb_token');
      if (token) {
        const res = await api.auth.getMe();
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      localStorage.removeItem('sb_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const loginAs = async (email: string, role?: UserRole, name?: string) => {
    setLoading(true);
    try {
      const res = await api.auth.login({ email, role, name });
      localStorage.setItem('sb_token', res.token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('sb_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginAs, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
