import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Trash2, AlertTriangle, Camera, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BAY_AREA_CITIES } from '../constants/locations';
import ArtistStylesForm, { EMPTY_ARTIST_STYLES } from './ArtistStylesForm';

const ProfilePage = () => {
  const { currentUser, userType, logout, updateCurrentUser } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
          foundationalStyles: currentUser.foundationalStyles || [],
          foundationalStyleSpecialties: currentUser.foundationalStyleSpecialties || [],
          techniques: currentUser.techniques || [],
          techniqueSpecialties: currentUser.techniqueSpecialties || [],
          subjects: currentUser.subjects || [],
          subjectSpecialties: currentUser.subjectSpecialties || [],
        });
      }

      if (currentUser.profilePic && currentUser.profilePic !== '/default-profile.png') {
        setProfileImagePreview(`http://localhost:5000/${currentUser.profilePic}`);
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
      setProfileImagePreview(`http://localhost:5000/${currentUser.profilePic}`);
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
      const response = await fetch('http://localhost:5000/api/users/profile-picture', {
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
          foundationalStyles: artistStyles.foundationalStyles,
          foundationalStyleSpecialties: artistStyles.foundationalStyleSpecialties,
          techniques: artistStyles.techniques,
          techniqueSpecialties: artistStyles.techniqueSpecialties,
          subjects: artistStyles.subjects,
          subjectSpecialties: artistStyles.subjectSpecialties,
        }),
      };

      const response = await fetch('http://localhost:5000/api/users/update', {
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
      await fetch(`http://localhost:5000/api/users/${currentUser._id}`, {
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

  return (
    <div className="max-w-screen-xl mx-auto p-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="bg-blue-500 h-32 flex items-center justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-full overflow-hidden border-4 border-white relative">
              {profileImagePreview ? (
                <img src={profileImagePreview} alt={currentUser?.username || 'Profile'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-3xl text-gray-500">
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

            {/* Editable fields - only for artists and shops */}
            {['artist', 'shop'].includes(userType) && (
              <>
                <div className="pb-4 border-b">
                  <label htmlFor="bio" className="font-semibold block mb-2">Bio:</label>
                  <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={4} className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Tell people about yourself..." />
                </div>
                <div className="pb-4 border-b">
                  <label htmlFor="location" className="font-semibold block mb-2">Location:</label>
                  <select id="location" name="location" value={formData.location} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select a Location</option>
                    {BAY_AREA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>
              </>
            )}

            {/* Price Range - only for artists */}
            {userType === 'artist' && (
              <div className="pb-4 border-b">
                <label className="font-semibold block mb-2">Price Range:</label>
                <div className="flex justify-center flex-wrap gap-2">
                  {['$', '$$', '$$$', '$$$$'].map(price => (
                    <button key={price} type="button" onClick={() => setFormData({ ...formData, priceRange: price })} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.priceRange === price ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                      {price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Specialties - only for artists */}
            {userType === 'artist' && (
              <div className="pb-4 border-b">
                <h3 className="font-semibold mb-1">Specialties &amp; Styles:</h3>
                <p className="text-xs text-gray-500 mb-4">Tap once = can do (blue) &nbsp;·&nbsp; Tap again = ★ specialty (gold, max 2 per group)</p>
                <ArtistStylesForm value={artistStyles} onChange={setArtistStyles} />
              </div>
            )}

            <div className="flex justify-center gap-4 mt-6">
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center text-red-600 mb-4">
              <AlertTriangle size={24} className="mr-2" />
              <h2 className="text-xl font-bold">Delete Account</h2>
            </div>
            <p className="mb-6">Are you sure you want to delete your account? This action cannot be undone and will:</p>
            <ul className="list-disc pl-5 mb-6 text-gray-700">
              <li>Permanently delete your profile information</li>
              <li>Delete all your posts and comments</li>
              <li>Remove all your followers and following connections</li>
              {userType === 'shop' && <li>Remove your shop association from all your artists</li>}
            </ul>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>}
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50" disabled={isDeleting}>Cancel</button>
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
