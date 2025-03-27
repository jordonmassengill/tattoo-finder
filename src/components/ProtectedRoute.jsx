import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Component to protect routes that require authentication
const ProtectedRoute = ({ children, allowedUserTypes = [] }) => {
  const { currentUser, userType, loading } = useAuth();
  
  // Show loading state if auth is still being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // If specific user types are allowed and current user isn't one of them
  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(userType)) {
    return <Navigate to="/home" />;
  }
  
  // User is authenticated and allowed, render the children
  return children;
};

export default ProtectedRoute;