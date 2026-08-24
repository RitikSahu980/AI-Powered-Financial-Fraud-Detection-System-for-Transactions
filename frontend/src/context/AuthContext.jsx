import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { loginUser, registerUser, clearSession } from '../services/authService';

const AuthContext = createContext(null);

function readStoredUser() {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('accessToken');
  if (!userId || !token) return null;
  return {
    userId,
    role: localStorage.getItem('userRole'),
    fullName: localStorage.getItem('userFullName'),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async ({ email, password }) => {
    setIsLoading(true);
    try {
      const { accessToken, refreshToken, userId, role } = await loginUser({ email, password });
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userRole', role);
      setUser({ userId, role, fullName: null });
      return { userId, role };
    } finally {
      setIsLoading(false);
    }
  }, []);

const register = useCallback(async ({
  fullName,
  username,
  email,
  password,
}) => {
  setIsLoading(true);
  try {
    return await registerUser({
      fullName,
      username,
      email,
      password,
    });
  } finally {
    setIsLoading(false);
  }
}, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
