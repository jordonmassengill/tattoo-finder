import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Bookmark, PlusSquare, User, LogOut, Settings, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UploadPost from './UploadPost';

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userType, logout } = useAuth();
  
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const profileRef = useRef(null);
  const addRef = useRef(null);
  
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (addRef.current && !addRef.current.contains(event.target)) {
        setShowAddMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Determine if a nav link is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <>
      <nav className="bg-white border-b fixed bottom-0 left-0 right-0 md:top-0 md:bottom-auto z-40">
        <div className="max-w-screen-xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
          {/* Logo - only visible on medium screens and up */}
          <div className="hidden md:block">
            <Link to="/" className="text-xl font-bold">InkSpace</Link>
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
              <div className="relative" ref={addRef}>
                <button 
                  className={`p-2 flex flex-col md:flex-row items-center ${showAddMenu ? 'text-blue-500' : 'text-gray-500'}`}
                  onClick={() => setShowAddMenu(!showAddMenu)}
                >
                  <PlusSquare size={24} className="md:mr-1" />
                  <span className="text-xs md:text-sm">Add</span>
                </button>
                
                {/* Add Menu Dropdown */}
                {showAddMenu && (
                  <div className="absolute bottom-14 md:top-14 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 w-48 z-50">
                    <button 
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                      onClick={() => {
                        setShowAddMenu(false);
                        setShowUploadModal(true);
                      }}
                    >
                      Upload Artwork
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
              <Bookmark size={24} className="md:mr-1" />
              <span className="text-xs md:text-sm">Saved</span>
            </Link>
            
            {/* Profile Menu */}
            <div className="relative" ref={profileRef}>
              <button 
                className={`p-2 flex flex-col md:flex-row items-center ${showProfileMenu || isActive('/profile') ? 'text-blue-500' : 'text-gray-500'}`}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <User size={24} className="md:mr-1" />
                <span className="text-xs md:text-sm">Profile</span>
              </button>
              
              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div className="absolute bottom-14 md:top-14 md:right-0 left-1/2 transform -translate-x-1/2 md:translate-x-0 bg-white rounded-lg shadow-lg p-2 w-48 z-50">
                  <div className="px-3 py-2 border-b mb-1">
                    <p className="font-medium">{currentUser?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{userType}</p>
                  </div>
                  
                  <Link 
                    to="/profile" 
                    className="flex items-center w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <User size={16} className="mr-2" />
                    View Profile
                  </Link>
                  
                  {userType === 'artist' && (
                    <Link 
                      to="/artist-dashboard" 
                      className="flex items-center w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Briefcase size={16} className="mr-2" />
                      Artist Dashboard
                    </Link>
                  )}
                  
                  {userType === 'shop' && (
                    <Link 
                      to="/shop-dashboard" 
                      className="flex items-center w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Briefcase size={16} className="mr-2" />
                      Shop Dashboard
                    </Link>
                  )}
                  
                  <Link 
                    to="/settings" 
                    className="flex items-center w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Settings size={16} className="mr-2" />
                    Settings
                  </Link>
                  
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-red-600"
                  >
                    <LogOut size={16} className="mr-2" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
    
    {/* Upload Modal */}
    {showUploadModal && (
      <UploadPost onClose={() => setShowUploadModal(false)} />
    )}
    </>
  );
};

export default NavBar;