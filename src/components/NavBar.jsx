import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Bookmark, PlusSquare, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UploadPost from './UploadPost';
import ProfileImage from './ProfileImage';

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userType, logout } = useAuth();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [refreshFeed, setRefreshFeed] = useState(false);
  
  const profileRef = useRef(null);
  
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
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
            <div className="flex justify-around md:justify-center w-full md:w-auto space-x-2 md:space-x-8">
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
                <button 
                  className={`p-2 flex flex-col md:flex-row items-center ${isActive('/upload') ? 'text-blue-500' : 'text-gray-500'}`}
                  onClick={() => setShowUploadModal(true)}
                >
                  <PlusSquare size={24} className="md:mr-1" />
                  <span className="text-xs md:text-sm">Add</span>
                </button>
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
                  {currentUser ? (
                    <ProfileImage user={currentUser} size="sm" className="mb-1 md:mb-0 md:mr-1" />
                  ) : (
                    <User size={24} className="md:mr-1" />
                  )}
                  <span className="text-xs md:text-sm">Profile</span>
                </button>
                
                {/* Profile Menu Dropdown - Using fixed positioning to ensure it appears where we want */}
                {showProfileMenu && (
                  <div style={{ position: 'absolute', top: '60px', right: '-110px', zIndex: 9999 }} className="bg-white rounded-lg shadow-lg p-2 w-48 hidden md:block">
                    <div className="px-3 py-2 border-b mb-1">
                      <p className="font-medium">{currentUser?.username}</p>
                      <p className="text-xs text-gray-500 capitalize">{userType}</p>
                    </div>
                    
                    {/* Only show Profile link for artists and shops */}
                    {['artist', 'shop'].includes(userType) && currentUser?.username && (
                      <Link 
                        to={`/${userType}/${currentUser.username}`} 
                        className="flex items-center w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <User size={16} className="mr-2" />
                        Profile
                      </Link>
                    )}
                    
                    <Link 
                      to="/profile" 
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
                
                {/* Mobile dropdown - positioned above */}
                {showProfileMenu && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg p-2 w-48 z-50 block md:hidden">
                    <div className="px-3 py-2 border-b mb-1">
                      <p className="font-medium">{currentUser?.username}</p>
                      <p className="text-xs text-gray-500 capitalize">{userType}</p>
                    </div>
                    
                    {/* Only show Profile link for artists and shops */}
                    {['artist', 'shop'].includes(userType) && currentUser?.username && (
                      <Link 
                        to={`/${userType}/${currentUser.username}`} 
                        className="flex items-center w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <User size={16} className="mr-2" />
                        Profile
                      </Link>
                    )}
                    
                    <Link 
                      to="/profile" 
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
        <UploadPost
          onClose={() => setShowUploadModal(false)}
          onPostCreated={() => {
            // Trigger a refresh of the feed
            setRefreshFeed(prev => !prev);
            // You can also force navigation to home to see the new post
            navigate('/home');
          }}
        />
      )}
    </>
  );
};

export default NavBar;