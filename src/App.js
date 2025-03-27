import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage';
import SearchPage from './components/SearchPage';
import HomeFeed from './components/HomeFeed';
import ArtistProfile from './components/ArtistProfile';
import ShopProfile from './components/ShopProfile';
import ProfilePage from './components/ProfilePage';
import NavBar from './components/NavBar';
import PublicNavBar from './components/PublicNavBar';
import Login from './components/Login';
import Signup from './components/Signup';
import UploadPost from './components/UploadPost';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles.css';

// Layout component that conditionally renders the appropriate NavBar
const Layout = ({ children }) => {
  const { currentUser, userType } = useAuth();
  
  return (
    <>
      {currentUser ? (
        <NavBar userType={userType} />
      ) : (
        <Routes>
          <Route path="/search" element={<PublicNavBar />} />
          <Route path="/login" element={<PublicNavBar />} />
          <Route path="/signup" element={<PublicNavBar />} />
          <Route path="/artist/*" element={<PublicNavBar />} />
          <Route path="/shop/*" element={<PublicNavBar />} />
        </Routes>
      )}
      
      <main className={currentUser ? "pb-16 md:pt-16 md:pb-0" : "pt-16"}>
        {children}
      </main>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

// Separate component to use the auth context
function AppContent() {
  const { currentUser, userType, loading } = useAuth();
  
  // Protected route renderer function
  const renderProtectedRoute = (element, allowedUserTypes = []) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
    if (!currentUser) {
      return <Navigate to="/login" />;
    }
    
    if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(userType)) {
      return <Navigate to="/home" />;
    }
    
    return element;
  };
  
  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={!currentUser ? <LandingPage /> : <Navigate to="/home" />} />
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/home" />} />
        <Route path="/signup" element={!currentUser ? <Signup /> : <Navigate to="/home" />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/artist/:id" element={<ArtistProfile />} />
        <Route path="/shop/:id" element={<ShopProfile />} />
        
        {/* Protected routes (require authentication) */}
        <Route 
          path="/home" 
          element={renderProtectedRoute(<HomeFeed />)} 
        />
        
        <Route 
          path="/saved" 
          element={renderProtectedRoute(
            <div className="p-8 text-center">Saved items coming soon</div>
          )} 
        />
        
        {/* Profile route - only accessible to logged in users */}
        <Route 
          path="/profile" 
          element={renderProtectedRoute(<ProfilePage />)} 
        />
        
        {/* Routes that require specific user types */}
        <Route 
          path="/artist-dashboard" 
          element={renderProtectedRoute(
            <div className="p-8 text-center">Artist Dashboard coming soon</div>,
            ['artist']
          )} 
        />
        
        <Route 
          path="/shop-dashboard" 
          element={renderProtectedRoute(
            <div className="p-8 text-center">Shop Dashboard coming soon</div>,
            ['shop']
          )} 
        />
        
        {/* Settings page */}
        <Route 
          path="/settings" 
          element={renderProtectedRoute(
            <div className="p-8 max-w-screen-xl mx-auto">
              <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
                <p className="text-gray-600">Settings page is coming soon.</p>
              </div>
            </div>
          )} 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default App;