import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, BookmarkIcon, PlusSquare, User } from 'lucide-react';

const NavBar = ({ userType = 'enthusiast' }) => {
  const location = useLocation();
  const [showAddMenu, setShowAddMenu] = useState(false);
  
  // Determine if a nav link is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="bg-white border-b fixed bottom-0 left-0 right-0 md:top-0 md:bottom-auto z-50">
      <div className="max-w-screen-xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo - only visible on medium screens and up */}
          <div className="hidden md:block">
            <Link to="/" className="text-xl font-bold">InkConnect</Link>
          </div>
          
          {/* Navigation Links */}
          <div className="flex justify-around md:justify-center w-full md:w-auto space-x-1 md:space-x-6">
            <Link to="/home" className={`p-2 flex flex-col md:flex-row items-center ${isActive('/home') ? 'text-blue-500' : 'text-gray-500'}`}>
              <Home size={24} className="md:mr-1" />
              <span className="text-xs md:text-sm">Home</span>
            </Link>
            
            <Link to="/search" className={`p-2 flex flex-col md:flex-row items-center ${isActive('/search') ? 'text-blue-500' : 'text-gray-500'}`}>
              <Search size={24} className="md:mr-1" />
              <span className="text-xs md:text-sm">Search</span>
            </Link>
            
            {/* Add Post Button - Only visible for artists and shops */}
            {['artist', 'shop'].includes(userType) && (
              <div className="relative">
                <button 
                  className={`p-2 flex flex-col md:flex-row items-center ${showAddMenu ? 'text-blue-500' : 'text-gray-500'}`}
                  onClick={() => setShowAddMenu(!showAddMenu)}
                >
                  <PlusSquare size={24} className="md:mr-1" />
                  <span className="text-xs md:text-sm">Add</span>
                </button>
                
                {/* Add Menu Dropdown */}
                {showAddMenu && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 w-48">
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">
                      Upload Photo
                    </button>
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">
                      Upload Video
                    </button>
                    {userType === 'shop' && (
                      <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">
                        Add Artist
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <Link to="/saved" className={`p-2 flex flex-col md:flex-row items-center ${isActive('/saved') ? 'text-blue-500' : 'text-gray-500'}`}>
              <BookmarkIcon size={24} className="md:mr-1" />
              <span className="text-xs md:text-sm">Saved</span>
            </Link>
            
            <Link to="/profile" className={`p-2 flex flex-col md:flex-row items-center ${isActive('/profile') ? 'text-blue-500' : 'text-gray-500'}`}>
              <User size={24} className="md:mr-1" />
              <span className="text-xs md:text-sm">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;