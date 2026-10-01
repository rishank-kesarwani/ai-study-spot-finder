'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, StudyPreferences } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, redirectTo?: string | false) => Promise<void>;
  register: (name: string, email: string, password: string, redirectTo?: string | false) => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (pref: Partial<StudyPreferences>) => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoginModalOpen: boolean;
  loginModalMessage: string;
  openLoginModal: (message?: string, onAuthenticated?: () => void) => void;
  closeLoginModal: () => void;
  requireAuth: (action: () => void, message?: string) => void;
  savedSpotIds: string[];
  setSavedSpotIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [savedSpotIds, setSavedSpotIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginModalMessage, setLoginModalMessage] = useState<string>(
    'Sign in to save your favourite study spots and access personal study playlists.',
  );
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('study_access_token');
      if (!token || !token.trim() || token === 'undefined' || token === 'null') {
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

  const login = async (
    email: string,
    password: string,
    redirectTo?: string | false,
  ) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('study_access_token', res.accessToken);
    localStorage.setItem('study_refresh_token', res.refreshToken);
    setUser(res.user);
    if (res.user?.savedSpotIds) {
      setSavedSpotIds(res.user.savedSpotIds);
    }
    setIsLoginModalOpen(false);

    // Execute any pending action that triggered auth
    if (pendingAction) {
      try {
        pendingAction();
      } catch (e) {
        console.error('Failed to execute pending action after login:', e);
      }
      setPendingAction(null);
    }

    if (redirectTo !== false && typeof redirectTo === 'string') {
      router.push(redirectTo);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    redirectTo?: string | false,
  ) => {
    const res = await authApi.register({ name, email, password });
    localStorage.setItem('study_access_token', res.accessToken);
    localStorage.setItem('study_refresh_token', res.refreshToken);
    setUser(res.user);
    if (res.user?.savedSpotIds) {
      setSavedSpotIds(res.user.savedSpotIds);
    }
    setIsLoginModalOpen(false);

    if (pendingAction) {
      try {
        pendingAction();
      } catch (e) {
        console.error('Failed to execute pending action after register:', e);
      }
      setPendingAction(null);
    }

    if (redirectTo !== false && typeof redirectTo === 'string') {
      router.push(redirectTo);
    }
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

  const openLoginModal = (message?: string, onAuthenticated?: () => void) => {
    setLoginModalMessage(
      message || 'Sign in to save your favourite study spots and personalize recommendations.',
    );
    if (onAuthenticated) {
      setPendingAction(() => onAuthenticated);
    }
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setPendingAction(null);
  };

  const requireAuth = (action: () => void, message?: string) => {
    if (user) {
      action();
    } else {
      openLoginModal(message, action);
    }
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
        requireAuth,
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
