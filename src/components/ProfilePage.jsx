import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { currentUser, userType, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-screen-xl mx-auto p-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="bg-blue-500 h-32 flex items-center justify-center">
          <div className="w-24 h-24 bg-white rounded-full overflow-hidden border-4 border-white">
            <img 
              src={currentUser?.profilePic || '/api/placeholder/150/150'} 
              alt={currentUser?.username} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            {currentUser?.username}
          </h1>
          
          <div className="space-y-4 max-w-lg mx-auto">
            <div className="flex justify-between pb-4 border-b">
              <span className="font-semibold">Account Type:</span>
              <span className="capitalize">{userType}</span>
            </div>
            
            <div className="flex justify-between pb-4 border-b">
              <span className="font-semibold">Email:</span>
              <span>{currentUser?.email}</span>
            </div>
            
            {currentUser?.username && (
              <div className="flex justify-between pb-4 border-b">
                <span className="font-semibold">Username:</span>
                <span>@{currentUser.username}</span>
              </div>
            )}
            
            {currentUser?.location && (
              <div className="flex justify-between pb-4 border-b">
                <span className="font-semibold">Location:</span>
                <span>{currentUser.location}</span>
              </div>
            )}
            
            {currentUser?.bio && (
              <div className="pb-4 border-b">
                <span className="font-semibold block mb-2">Bio:</span>
                <p>{currentUser.bio}</p>
              </div>
            )}
            
            {currentUser?.styles && currentUser.styles.length > 0 && (
              <div className="pb-4 border-b">
                <span className="font-semibold block mb-2">Tattoo Styles:</span>
                <div className="flex flex-wrap gap-2">
                  {currentUser.styles.map(style => (
                    <span 
                      key={style} 
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-center mt-6">
              <button 
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <LogOut className="mr-2" size={18} />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;