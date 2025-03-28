// src/components/ProfileImage.jsx
import React from 'react';

const ProfileImage = ({ user, size = 'md', className = '' }) => {
  // Determine size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };
  
  const fontSizes = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl'
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const fontSize = fontSizes[size] || fontSizes.md;
  
  // Check if user has a valid profile picture
  const hasValidProfilePic = user?.profilePic && 
                             user.profilePic !== '/default-profile.png' && 
                             !user.profilePic.includes('undefined');
  
  return (
    <div className={`${sizeClass} rounded-full overflow-hidden flex-shrink-0 ${className}`}>
      {hasValidProfilePic ? (
        <img 
          src={`http://localhost:5000/${user.profilePic}`} 
          alt={user?.username || "User"} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, show the letter avatar
            e.target.style.display = 'none';
            e.target.parentNode.classList.add('bg-gray-300');
            e.target.parentNode.innerHTML += `
              <div class="w-full h-full flex items-center justify-center">
                <span class="${fontSize} text-gray-600 font-semibold">
                  ${user?.username ? user.username.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
            `;
          }}
        />
      ) : (
        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
          <span className={`${fontSize} text-gray-600 font-semibold`}>
            {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProfileImage;