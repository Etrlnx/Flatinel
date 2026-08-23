import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          const res = await authApi.getMe();
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Session expired or invalid token:", err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { access_token, user: loggedUser } = res.data;
    setToken(access_token);
    setUser(loggedUser);
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(loggedUser));
    return loggedUser;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    const { access_token, user: registeredUser } = res.data;
    setToken(access_token);
    setUser(registeredUser);
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(registeredUser));
    return registeredUser;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
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
