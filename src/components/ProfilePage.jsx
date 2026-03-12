import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Trash2, AlertTriangle, Camera, X, KeyRound, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BAY_AREA_CITIES } from '../constants/locations';
import ArtistStylesForm, { EMPTY_ARTIST_STYLES } from './ArtistStylesForm';

const ProfilePage = () => {
  const { currentUser, userType, logout, updateCurrentUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    priceRange: '',
  });

  const [artistStyles, setArtistStyles] = useState(EMPTY_ARTIST_STYLES);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        bio: currentUser.bio || '',
        location: currentUser.location || '',
        priceRange: currentUser.priceRange || '',
      });

      if (currentUser.userType === 'artist') {
        setArtistStyles({
          inkSpecialty: currentUser.inkSpecialty || '',
          designSpecialty: currentUser.designSpecialty || '',
          styles: currentUser.styles || [],
          styleSpecialties: currentUser.styleSpecialties || [],
          subjects: currentUser.subjects || [],
          subjectSpecialties: currentUser.subjectSpecialties || [],
        });
      }

      if (currentUser.profilePic && currentUser.profilePic !== '/default-profile.png') {
        setProfileImagePreview(`https://tattoo-finder-backend-production.up.railway.app/${currentUser.profilePic}`);
      } else {
        setProfileImagePreview(null);
      }
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePicClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfileImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCancelProfilePic = () => {
    setProfileImageFile(null);
    if (currentUser?.profilePic && currentUser.profilePic !== '/default-profile.png') {
      setProfileImagePreview(`https://tattoo-finder-backend-production.up.railway.app/${currentUser.profilePic}`);
    } else {
      setProfileImagePreview(null);
    }
  };

  const handleUploadProfilePic = async () => {
    if (!profileImageFile) return;
    setIsUploadingImage(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('profilePic', profileImageFile);
      const response = await fetch('https://tattoo-finder-backend-production.up.railway.app/api/users/profile-picture', {
        method: 'PUT',
        headers: { 'x-auth-token': localStorage.getItem('token') },
        body: fd
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile picture');
      }
      const data = await response.json();
      updateCurrentUser({ ...currentUser, profilePic: data.profilePic });
      setSuccessMessage('Profile picture updated successfully!');
      setProfileImageFile(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating profile picture:', err);
      setError(err.message || 'Failed to update profile picture');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const body = {
        bio: formData.bio,
        location: formData.location,
        priceRange: formData.priceRange,
        ...(userType === 'artist' && {
          inkSpecialty: artistStyles.inkSpecialty,
          designSpecialty: artistStyles.designSpecialty,
          styles: artistStyles.styles,
          styleSpecialties: artistStyles.styleSpecialties,
          subjects: artistStyles.subjects,
          subjectSpecialties: artistStyles.subjectSpecialties,
        }),
      };

      const response = await fetch('https://tattoo-finder-backend-production.up.railway.app/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedUserData = await response.json();
      updateCurrentUser(updatedUserData);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    setIsDeleting(true);
    setError('');
    try {
      await fetch(`https://tattoo-finder-backend-production.up.railway.app/api/users/${currentUser._id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      logout();
      navigate('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Please fill in all fields');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    setIsChangingPassword(true);
    try {
      const response = await fetch('https://tattoo-finder-backend-production.up.railway.app/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token'),
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to change password');
      }
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setPasswordSuccess('');
        setShowPasswordModal(false);
      }, 2000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto p-8">
      <div className="bg-white dark:bg-zinc-900 shadow rounded-lg overflow-hidden">
        <div className="bg-blue-500 h-32 flex items-center justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-full overflow-hidden border-4 border-white relative">
              {profileImagePreview ? (
                <img src={profileImagePreview} alt={currentUser?.username || 'Profile'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-300 dark:bg-zinc-700 flex items-center justify-center">
                  <span className="text-3xl text-gray-500 dark:text-gray-300">
                    {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <div onClick={handleProfilePicClick} className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            {profileImageFile && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
                <button onClick={handleUploadProfilePic} disabled={isUploadingImage} className="bg-blue-500 text-white p-1 rounded-full shadow hover:bg-blue-600 transition-colors">
                  {isUploadingImage ? <div className="w-6 h-6 animate-spin border-2 border-white border-t-transparent rounded-full" /> : <Save size={16} />}
                </button>
                <button onClick={handleCancelProfilePic} className="bg-gray-500 text-white p-1 rounded-full shadow hover:bg-gray-600 transition-colors">
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Settings</h1>

          {successMessage && <div className="bg-green-50 text-green-700 p-3 rounded mb-4">{successMessage}</div>}
          {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>}

          <div className="space-y-4 max-w-lg mx-auto">
            {/* Dark Mode Toggle */}
            <div className="flex justify-between items-center pb-4 border-b dark:border-zinc-800">
              <div>
                <span className="font-semibold">Dark Mode</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Switch between light and dark theme</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${isDark ? 'bg-blue-600' : 'bg-gray-300'}`}
                aria-label="Toggle dark mode"
              >
                <span className={`inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow transition-transform ${isDark ? 'translate-x-8' : 'translate-x-1'}`}>
                  {isDark ? <Moon size={12} className="text-blue-600" /> : <Sun size={12} className="text-yellow-500" />}
                </span>
              </button>
            </div>

            <div className="flex justify-between pb-4 border-b dark:border-zinc-800">
              <span className="font-semibold">Account Type:</span>
              <span className="capitalize">{userType}</span>
            </div>
            <div className="flex justify-between pb-4 border-b dark:border-zinc-800">
              <span className="font-semibold">Email:</span>
              <span>{currentUser?.email}</span>
            </div>
            {currentUser?.username && (
              <div className="flex justify-between pb-4 border-b dark:border-zinc-800">
                <span className="font-semibold">Username:</span>
                <span>@{currentUser.username}</span>
              </div>
            )}

            {/* Editable fields - only for artists and shops */}
            {['artist', 'shop'].includes(userType) && (
              <>
                <div className="pb-4 border-b dark:border-zinc-800">
                  <label htmlFor="bio" className="font-semibold block mb-2">Bio:</label>
                  <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={4} className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-200 dark:placeholder-gray-400" placeholder="Tell people about yourself..." />
                </div>
                <div className="pb-4 border-b dark:border-zinc-800">
                  <label htmlFor="location" className="font-semibold block mb-2">Location:</label>
                  <select id="location" name="location" value={formData.location} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-200">
                    <option value="">Select a Location</option>
                    {BAY_AREA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>
              </>
            )}

            {/* Price Range - only for artists */}
            {userType === 'artist' && (
              <div className="pb-4 border-b dark:border-zinc-800">
                <label className="font-semibold block mb-2">Price Range:</label>
                <div className="flex justify-center flex-wrap gap-2">
                  {['$', '$$', '$$$', '$$$$'].map(price => (
                    <button key={price} type="button" onClick={() => setFormData({ ...formData, priceRange: formData.priceRange === price ? '' : price })} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.priceRange === price ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-zinc-700'}`}>
                      {price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Specialties - only for artists */}
            {userType === 'artist' && (
              <div className="pb-4 border-b dark:border-zinc-800">
                <h3 className="font-semibold mb-1">Specialties &amp; Styles:</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Tap once = can do (blue) &nbsp;·&nbsp; Tap again = ★ specialty (gold, max 2 per group)</p>
                <ArtistStylesForm value={artistStyles} onChange={setArtistStyles} />
              </div>
            )}

            <div className="flex justify-center gap-4 mt-6 flex-wrap">
              <button onClick={() => { setPasswordError(''); setPasswordSuccess(''); setShowPasswordModal(true); }} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                <KeyRound className="mr-2" size={18} />
                Change Password
              </button>
              <button onClick={handleSaveProfile} disabled={isSaving} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300">
                {isSaving ? (
                  <>
                    <span className="mr-2">Saving...</span>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  </>
                ) : (
                  <>
                    <Save className="mr-2" size={18} />
                    Save Changes
                  </>
                )}
              </button>
              <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                <Trash2 className="mr-2" size={18} />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Change Password</h2>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>
            {passwordSuccess && <div className="bg-green-50 text-green-700 p-3 rounded mb-4">{passwordSuccess}</div>}
            {passwordError && <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{passwordError}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-200 dark:placeholder-gray-400"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-200 dark:placeholder-gray-400"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-200 dark:placeholder-gray-400"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowPasswordModal(false)} className="px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800 dark:text-gray-200" disabled={isChangingPassword}>Cancel</button>
              <button onClick={handleChangePassword} disabled={isChangingPassword} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                {isChangingPassword ? (
                  <>
                    <span className="mr-2">Saving...</span>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  </>
                ) : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center text-red-600 mb-4">
              <AlertTriangle size={24} className="mr-2" />
              <h2 className="text-xl font-bold">Delete Account</h2>
            </div>
            <p className="mb-6">Are you sure you want to delete your account? This action cannot be undone and will:</p>
            <ul className="list-disc pl-5 mb-6 text-gray-700 dark:text-gray-300">
              <li>Permanently delete your profile information</li>
              <li>Delete all your posts and comments</li>
              <li>Remove all your followers and following connections</li>
              {userType === 'shop' && <li>Remove your shop association from all your artists</li>}
            </ul>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>}
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800 dark:text-gray-200" disabled={isDeleting}>Cancel</button>
              <button onClick={handleDeleteAccount} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300" disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <span className="mr-2">Deleting...</span>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  </>
                ) : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
