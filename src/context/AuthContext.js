import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

// Create context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);
  
  // Load user data
  const loadUser = async () => {
    try {
      const res = await api.getCurrentUser();
      setCurrentUser(res.data);
    } catch (err) {
      localStorage.removeItem('token');
      setError('Session expired. Please login again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Login
  const login = async (username, password) => {
    setError('');
    try {
      console.log('Attempting login with username:', username);
      const res = await api.login(username, password);
      console.log('Login response:', res);
      localStorage.setItem('token', res.data.token);
      setCurrentUser(res.data.user);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      return false;
    }
  };
  
  // Register
  const signup = async (userData) => {
    setError('');
    try {
      const res = await api.register(userData);
      localStorage.setItem('token', res.data.token);
      setCurrentUser(res.data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      return false;
    }
  };
  
  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };
  
  const value = {
    currentUser,
    userType: currentUser?.userType || 'guest',
    loading,
    error,
    login,
    signup,
    logout
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};