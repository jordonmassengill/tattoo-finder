import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage';
import SearchPage from './components/SearchPage';
import HomeFeed from './components/HomeFeed';
import ArtistProfile from './components/ArtistProfile';
import ShopProfile from './components/ShopProfile';
import NavBar from './components/NavBar';
import PublicNavBar from './components/PublicNavBar';
import './styles.css';

function App() {
  // Mock authentication state - in a real app, this would come from your auth system
  const isLoggedIn = false; // Set to false to test landing page flow
  
  // Mock user type - can be 'enthusiast', 'artist', or 'shop'
  const userType = 'enthusiast'; 
  
  return (
    <BrowserRouter>
      {/* Conditionally render NavBar only if user is logged in */}
      {isLoggedIn && <NavBar userType={userType} />}
      
      {/* Public NavBar for search page when not logged in */}
      {!isLoggedIn && <Routes>
        <Route path="/search" element={<PublicNavBar />} />
      </Routes>}
      
      <main className={isLoggedIn ? "pb-16 md:pt-16 md:pb-0" : "pt-16"}>
        <Routes>
          {/* Landing page shown only to non-logged in users */}
          <Route path="/" element={!isLoggedIn ? <LandingPage /> : <Navigate to="/home" />} />
          
          {/* Protected routes (require login) */}
          <Route path="/home" element={isLoggedIn ? <HomeFeed /> : <Navigate to="/" />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/artist/:id" element={<ArtistProfile />} />
          <Route path="/shop/:id" element={<ShopProfile />} />
          
          {/* Placeholder routes */}
          <Route path="/saved" element={<div className="p-8 text-center">Saved items coming soon</div>} />
          <Route path="/profile" element={<div className="p-8 text-center">Profile page coming soon</div>} />
          <Route path="/login" element={<div className="p-8 text-center">Login page coming soon</div>} />
          <Route path="/signup" element={<div className="p-8 text-center">Signup page coming soon</div>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;