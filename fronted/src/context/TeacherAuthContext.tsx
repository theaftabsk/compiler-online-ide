'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TeacherUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  institutionName: string | null;
  departmentName: string | null;
  designation: string | null;
  createdAt?: string;
}

interface TeacherAuthContextType {
  teacher: TeacherUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    institutionName?: string;
    departmentName?: string;
    designation?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const TeacherAuthContext = createContext<TeacherAuthContextType | undefined>(undefined);

const TOKEN_KEY = 'kaspro_teacher_token';
const USER_KEY = 'kaspro_teacher_user';

export function TeacherAuthProvider({ children }: { children: ReactNode }) {
  const [teacher, setTeacher] = useState<TeacherUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Rehydrate auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        const savedUser = localStorage.getItem(USER_KEY);

        if (savedToken && savedUser) {
          setToken(savedToken);
          setTeacher(JSON.parse(savedUser));

          // Verify token validity against backend
          try {
            const res = await fetch('/api/auth/me', {
              headers: { Authorization: `Bearer ${savedToken}` },
            });
            if (res.ok) {
              const data = await res.json();
              if (data.user) {
                setTeacher(data.user);
                localStorage.setItem(USER_KEY, JSON.stringify(data.user));
              }
            } else if (res.status === 401) {
              // Token expired
              logout();
            }
          } catch (_) {
            // Offline or network lag, keep cached user
          }
        }
      } catch (e) {
        console.error('Error rehydrating teacher auth:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.message || 'Invalid email or password. Please try again.',
        };
      }

      setToken(data.token);
      setTeacher(data.user);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: `Network error: ${err.message || 'Could not reach authentication server.'}`,
      };
    }
  };

  const register = async (data: {
    fullName: string;
    email: string;
    password: string;
    institutionName?: string;
    departmentName?: string;
    designation?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        return {
          success: false,
          error: resData.message || 'Registration failed. Please check your information.',
        };
      }

      setToken(resData.token);
      setTeacher(resData.user);
      localStorage.setItem(TOKEN_KEY, resData.token);
      localStorage.setItem(USER_KEY, JSON.stringify(resData.user));

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: `Network error: ${err.message || 'Could not reach authentication server.'}`,
      };
    }
  };

  const logout = () => {
    setToken(null);
    setTeacher(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  };

  return (
    <TeacherAuthContext.Provider
      value={{
        teacher,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!teacher && !!token,
      }}
    >
      {children}
    </TeacherAuthContext.Provider>
  );
}

export function useTeacherAuth() {
  const context = useContext(TeacherAuthContext);
  if (!context) {
    throw new Error('useTeacherAuth must be used within a TeacherAuthProvider');
  }
  return context;
}
