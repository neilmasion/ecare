import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, loginUser, registerUser, logoutUser, clearApiCache } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Don't trust localStorage on mount
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        clearApiCache(); // Bypass stale cached responses
        const res = await getCurrentUser();
        if (res.data?.authenticated && res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('ecare_user', JSON.stringify(res.data.user));
        } else {
          setUser(null);
          localStorage.removeItem('ecare_user');
        }
      } catch (err) {
        // Backend unreachable — clear user to force login
        setUser(null);
        localStorage.removeItem('ecare_user');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    if (res.data?.user) {
      setUser(res.data.user);
      localStorage.setItem('ecare_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await registerUser(userData);
    if (res.data?.user) {
      setUser(res.data.user);
      localStorage.setItem('ecare_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const refreshUser = async () => {
    try {
      clearApiCache();
      const res = await getCurrentUser();
      if (res.data?.authenticated && res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('ecare_user', JSON.stringify(res.data.user));
        return res.data.user;
      }
    } catch (err) {}
    return null;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error(err);
    }
    setUser(null);
    localStorage.removeItem('ecare_user');
    clearApiCache(); // Purge cached /auth/me/ so refresh checks server
  };

  return (
    <AuthContext.Provider value={{ user, setUser, refreshUser, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
