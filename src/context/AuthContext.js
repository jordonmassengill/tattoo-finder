import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const AuthContext = createContext();

// This would connect to your backend in a real application
const mockUsers = [
  {
    id: 1,
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe',
    profilePic: '/api/placeholder/150/150',
    userType: 'enthusiast'
  },
  {
    id: 2,
    email: 'artist@example.com',
    password: 'password123',
    name: 'Jane Smith',
    username: 'inkmaster',
    profilePic: '/api/placeholder/150/150',
    userType: 'artist',
    bio: 'Specializing in blackwork and geometric designs',
    location: 'Brooklyn, NY',
    styles: ['Geometric', 'Blackwork', 'Minimalist']
  },
  {
    id: 3,
    email: 'shop@example.com',
    password: 'password123',
    name: 'InkCraft Studio',
    profilePic: '/api/placeholder/150/150',
    userType: 'shop',
    bio: 'Premium tattoo studio established in 2015',
    location: 'Brooklyn, NY'
  }
];

export const AuthProvider = ({ children }) => {
  // Try to get user from localStorage on initial load
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('inkspace_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Update localStorage when user changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('inkspace_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('inkspace_user');
    }
    setLoading(false);
  }, [currentUser]);

  // Login function
  const login = (email, password) => {
    setError('');
    
    // Find user with matching email and password
    const user = mockUsers.find(
      user => user.email === email && user.password === password
    );
    
    if (user) {
      // Remove password before storing in state
      const { password, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      return true;
    } else {
      setError('Invalid email or password');
      return false;
    }
  };

  // Signup function
  const signup = (userData) => {
    setError('');
    
    // Check if email already exists
    if (mockUsers.some(user => user.email === userData.email)) {
      setError('Email already in use');
      return false;
    }
    
    // In a real app, you would send this data to your backend
    // For now, we'll just simulate a successful signup
    const newUser = {
      id: mockUsers.length + 1,
      ...userData
    };
    
    // Add to mock users (would be done by backend in a real app)
    mockUsers.push(newUser);
    
    // Remove password before storing in state
    const { password, ...userWithoutPassword } = newUser;
    setCurrentUser(userWithoutPassword);
    return true;
  };

  // Logout function
  const logout = () => {
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

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
