'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, StudyPreferences } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (pref: Partial<StudyPreferences>) => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoginModalOpen: boolean;
  loginModalMessage: string;
  openLoginModal: (message?: string) => void;
  closeLoginModal: () => void;
  savedSpotIds: string[];
  setSavedSpotIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [savedSpotIds, setSavedSpotIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginModalMessage, setLoginModalMessage] = useState<string>('Please log in to continue.');

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('study_access_token');
      if (!token) {
        setUser(null);
        setSavedSpotIds([]);
        setIsLoading(false);
        return;
      }
      const userData = await authApi.getMe();
      setUser(userData);
      if (userData.savedSpotIds) {
        setSavedSpotIds(userData.savedSpotIds);
      }
    } catch (err) {
      localStorage.removeItem('study_access_token');
      localStorage.removeItem('study_refresh_token');
      setUser(null);
      setSavedSpotIds([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('study_access_token', res.accessToken);
    localStorage.setItem('study_refresh_token', res.refreshToken);
    setUser(res.user);
    if (res.user?.savedSpotIds) {
      setSavedSpotIds(res.user.savedSpotIds);
    }
    setIsLoginModalOpen(false);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authApi.register({ name, email, password });
    localStorage.setItem('study_access_token', res.accessToken);
    localStorage.setItem('study_refresh_token', res.refreshToken);
    setUser(res.user);
    if (res.user?.savedSpotIds) {
      setSavedSpotIds(res.user.savedSpotIds);
    }
    setIsLoginModalOpen(false);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('study_access_token');
      localStorage.removeItem('study_refresh_token');
      setUser(null);
      setSavedSpotIds([]);
    }
  };

  const updatePreferences = async (pref: Partial<StudyPreferences>) => {
    const updatedUser = await authApi.updatePreferences(pref);
    setUser(updatedUser);
  };

  const openLoginModal = (message?: string) => {
    setLoginModalMessage(message || 'Please log in or create an account to access this feature.');
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updatePreferences,
        refreshUser,
        isLoginModalOpen,
        loginModalMessage,
        openLoginModal,
        closeLoginModal,
        savedSpotIds,
        setSavedSpotIds,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
