'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { storageService } from '../services/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking session
    const checkSession = async () => {
      const sessionEmail = localStorage.getItem('session_email');
      if (sessionEmail) {
        // In a real app, this would verify a token
        const usr = await storageService.getUser();
        if (usr.email === sessionEmail) {
          setUser(usr);
        }
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  const login = async (email: string) => {
    // Mock login
    if (email === 'admin@example.com') {
      const usr = await storageService.getUser();
      setUser(usr);
      localStorage.setItem('session_email', email);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('session_email');
  };

  const refreshUser = async () => {
    if (user) {
      const updated = await storageService.getUser();
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};