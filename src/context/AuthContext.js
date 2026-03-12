// Add an updateCurrentUser function to AuthContext.js

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
  
  // Update current user data
  const updateCurrentUser = (userData) => {
    setCurrentUser(userData);
  };
  
  // Login
  const login = async (username, password) => {
    setError('');
    try {
      const res = await api.login(username, password);
      localStorage.setItem('token', res.data.token);
      setCurrentUser(res.data.user);
      return { success: true };
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || 'Login failed. Please try again.');
      return {
        success: false,
        emailNotVerified: data?.emailNotVerified || false,
        email: data?.email || '',
      };
    }
  };
  
  // Register — account is created but not activated until email is verified
  const signup = async (userData) => {
    setError('');
    try {
      const res = await api.register(userData);
      // Return the email so the "check your email" page can display it
      return { success: true, email: userData.email, emailSent: res.data.emailSent };
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      return { success: false };
    }
  };

  // Called after a successful email verification — logs the user in
  const verifyAndLogin = (token, user) => {
    localStorage.setItem('token', token);
    setCurrentUser(user);
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
    logout,
    updateCurrentUser,
    verifyAndLogin,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};