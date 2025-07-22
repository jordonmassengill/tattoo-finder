import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LayoutGrid, Grid, BarChart2, MapPin, Phone, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProfileImage from './ProfileImage';
import api from '../services/api';

const ShopProfile = () => {
  const [viewMode, setViewMode] = useState('grid3');
  const [shopData, setShopData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const { id } = useParams();
  const { currentUser } = useAuth();

  const isOwnProfile = currentUser && (currentUser.id === shopData?._id);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true);
        const profileResponse = await api.getUserById(id);
        const profileData = profileResponse.data;
        setShopData(profileData);
        setFollowersCount(profileData.followers?.length || 0);

        if (currentUser && profileData.followers) {
          const isUserFollowing = profileData.followers.some(followerId => followerId.toString() === currentUser.id);
          setFollowing(isUserFollowing);
        }

        const postsResponse = await api.getUserPosts(id);
        setPosts(postsResponse.data);

      } catch (error) {
        console.error('Error fetching shop data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchShopData();
    }
  }, [id, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) return;
    
    setIsFollowLoading(true);
    try {
      if (following) {
        await api.unfollowUser(shopData._id);
        setFollowersCount(prev => prev - 1);
        setFollowing(false);
      } else {
        await api.followUser(shopData._id);
        setFollowersCount(prev => prev + 1);
        setFollowing(true);
      }
    } catch (error) {
      console.error(`Error toggling follow:`, error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!shopData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold">Shop Not Found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto pb-16">
      <div className="relative h-56 md:h-80 bg-gray-200">
        <img src={shopData.coverPhoto || '/api/placeholder/1200/400'} alt={`${shopData.username} cover`} className="w-full h-full object-cover"/>
      </div>
      <div className="p-4 border-b relative">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden flex-shrink-0 mb-4 md:mb-0 md:mr-8 border-4 border-white bg-white relative -mt-16 md:-mt-20">
            <ProfileImage user={shopData} size="xl" className="w-full h-full" />
          </div>
          <div className="flex-grow text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <h1 className="text-2xl font-bold mr-4">{shopData.username}</h1>
              {currentUser && !isOwnProfile && (
                <button
                  className={`${following ? 'bg-gray-200 text-gray-800' : 'bg-blue-500 text-white'} px-4 py-2 rounded-md font-medium mt-2 md:mt-0 disabled:opacity-50`}
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                >
                  {isFollowLoading ? '...' : (following ? 'Following' : 'Follow')}
                </button>
              )}
            </div>
            <div className="flex justify-center md:justify-start space-x-6 mb-4">
              <span><b>{shopData.artists?.length || 0}</b> artists</span>
              <span><b>{posts.length}</b> tattoos</span>
              <span><b>{followersCount}</b> followers</span>
            </div>
            <div className="mb-2"><p>{shopData.bio}</p></div>
            <div className="flex flex-col space-y-1">
              {shopData.location && <div className="flex items-center"><MapPin size={16} className="mr-2" /><span>{shopData.location}</span></div>}
              {shopData.phone && <div className="flex items-center"><Phone size={16} className="mr-2" /><span>{shopData.phone}</span></div>}
              {shopData.hours && <div className="flex items-center"><Clock size={16} className="mr-2" /><span>{shopData.hours}</span></div>}
              {shopData.website && <div className="flex items-center"><a href={`https://${shopData.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-500">{shopData.website}</a></div>}
            </div>
          </div>
        </div>
      </div>

      {/* Artists Section (assuming artists are populated in the backend response) */}
      {shopData.artists && shopData.artists.length > 0 && (
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-4">Our Artists</h2>
          <div className="flex overflow-x-auto space-x-4 pb-4">
            {shopData.artists.map(artist => (
              <Link to={`/artist/${artist.username}`} key={artist._id} className="flex-shrink-0">
                <div className="w-24 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-2">
                    <ProfileImage user={artist} size="lg" className="w-full h-full" />
                  </div>
                  <p className="text-sm font-medium text-center">{artist.username}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* View Mode Selector */}
      <div className="flex justify-end p-4 border-b">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button 
            onClick={() => setViewMode('feed')}
            className={`p-2 rounded ${viewMode === 'feed' ? 'bg-white shadow' : ''}`}
          >
            <BarChart2 size={20} />
          </button>
          <button 
            onClick={() => setViewMode('grid3')}
            className={`p-2 rounded mx-1 ${viewMode === 'grid3' ? 'bg-white shadow' : ''}`}
          >
            <LayoutGrid size={20} />
          </button>
          <button 
            onClick={() => setViewMode('grid5')}
            className={`p-2 rounded ${viewMode === 'grid5' ? 'bg-white shadow' : ''}`}
          >
            <Grid size={20} />
          </button>
        </div>
      </div>
      
      {/* Gallery Grid */}
      <div className={`grid ${
        viewMode === 'feed' 
          ? 'grid-cols-1 max-w-xl mx-auto gap-6 p-4' 
          : viewMode === 'grid3' 
            ? 'grid-cols-3 gap-1' 
            : 'grid-cols-5 gap-1'
      }`}>
       {posts.map(post => (
         <div key={post._id} className="relative group cursor-pointer">
           <img src={`http://localhost:5000/${post.image}`} alt={post.caption} className="w-full aspect-square object-cover" />
           <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
             <div className="flex items-center mr-4">
                <span className="mr-2">❤️</span> {post.likes.length}
             </div>
             <Link to={`/artist/${post.user.username}`} className="absolute bottom-2 left-2 text-xs font-medium hover:underline">
               By: {post.user.username}
             </Link>
           </div>
         </div>
       ))}
     </div>
    </div>
  );
};

export default ShopProfile;