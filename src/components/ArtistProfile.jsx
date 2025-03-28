import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LayoutGrid, Grid, BarChart2, MapPin, DollarSign, Tag, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProfileImage from './ProfileImage';

const ArtistProfile = () => {
  const [viewMode, setViewMode] = useState('grid3');
  const [artistData, setArtistData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  
  const { id } = useParams();
  const { currentUser } = useAuth();
  
  // Check if current user is viewing their own profile
  const isOwnProfile = currentUser && (currentUser.id === artistData?._id || currentUser.username === artistData?.username);
  
  useEffect(() => {
    console.log('ArtistProfile rendered with id parameter:', id);
  }, [id]);

  // Fetch artist data
useEffect(() => {
  const fetchArtistData = async () => {
    try {
      setLoading(true);
      console.log(`Fetching artist profile for: ${id}`);
      
      // Fetch artist profile
      const profileResponse = await fetch(`http://localhost:5000/api/users/${id}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      console.log('Profile response status:', profileResponse.status);
      
      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        console.error('Error response:', errorData);
        throw new Error(`Failed to fetch artist profile: ${errorData.message || profileResponse.statusText}`);
      }
      
      const artistData = await profileResponse.json();
      console.log('Artist data received:', artistData.username);
      setArtistData(artistData);
      setFollowersCount(artistData.followers?.length || 0);
        
        // Check if current user is following this artist
        if (currentUser && artistData.followers) {
          setFollowing(artistData.followers.includes(currentUser.id));
        }
        
        // Fetch artist posts
console.log(`Attempting to fetch posts for: ${id}`);
const postsResponse = await fetch(`http://localhost:5000/api/users/${id}/posts`, {
  headers: {
    'x-auth-token': localStorage.getItem('token')
  }
});

console.log('Posts response status:', postsResponse.status);
if (!postsResponse.ok) {
  const errorData = await postsResponse.json().catch(() => ({}));
  console.error('Error response:', errorData);
  throw new Error('Failed to fetch artist posts');
}

const postsData = await postsResponse.json();
console.log(`Received ${postsData.length} posts for artist ${id}`);
setPosts(postsData);
        
      } catch (error) {
        console.error('Error fetching artist data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
    fetchArtistData();
    }
  }, [id, currentUser]);
  
  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!currentUser) {
      // Redirect to login if not authenticated
      return;
    }
    
    try {
      const endpoint = following ? 'unfollow' : 'follow';
      
      const response = await fetch(`http://localhost:5000/api/users/${endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${endpoint} artist`);
      }
      
      // Update state based on action
      if (following) {
        setFollowersCount(prev => prev - 1);
      } else {
        setFollowersCount(prev => prev + 1);
      }
      
      setFollowing(!following);
      
    } catch (error) {
      console.error(`Error ${following ? 'unfollowing' : 'following'} artist:`, error);
    }
  };
  
  // Handle delete post
  const handleDeletePost = async () => {
    if (!selectedPost) return;
    
    setIsDeleting(true);
    setDeleteError('');
    
    try {
      await api.deletePost(selectedPost._id);
      
      // Update posts list after deletion
      setPosts(posts.filter(post => post._id !== selectedPost._id));
      setSelectedPost(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting post:', error);
      setDeleteError('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!artistData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Artist Not Found</h2>
          <p>The artist you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-screen-xl mx-auto pb-16">
      {/* Profile Header */}
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          {/* Profile Picture */}
          <div className="w-28 h-28 md:w-36 md:h-36 flex-shrink-0 mb-4 md:mb-0 md:mr-8">
  <ProfileImage 
    user={artistData} 
    size="xl" 
    className="w-full h-full"
  />
</div>
          
          {/* Profile Info */}
          <div className="flex-grow text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center mb-4">
              <h1 className="text-2xl font-bold mr-4">{artistData.username}</h1>
              {/* Follow button */}
              {currentUser && currentUser.id !== artistData._id && (
                <button 
                  className={`${following ? 'bg-gray-200 text-gray-800' : 'bg-blue-500 text-white'} px-4 py-2 rounded-md font-medium mt-2 md:mt-0`}
                  onClick={handleFollowToggle}
                >
                  {following ? 'Following' : 'Follow Artist'}
                </button>
              )}
            </div>
            
            <div className="flex justify-center md:justify-start space-x-6 mb-4">
              <span><b>{posts.length}</b> posts</span>
              <span><b>{followersCount}</b> followers</span>
              <span><b>{artistData.following?.length || 0}</b> following</span>
            </div>
            
            <div className="mb-2">
              <p>{artistData.bio}</p>
            </div>
            
            <div className="flex flex-col space-y-1">
              {artistData.location && (
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2" />
                  <span>{artistData.location}</span>
                </div>
              )}
              
              {artistData.priceRange && (
                <div className="flex items-center">
                  <DollarSign size={16} className="mr-2" />
                  <span>Price Range: {artistData.priceRange}</span>
                </div>
              )}
              
              {artistData.styles && artistData.styles.length > 0 && (
                <div className="flex items-center">
                  <Tag size={16} className="mr-2" />
                  <span>Styles: {artistData.styles.join(', ')}</span>
                </div>
              )}
              
              {artistData.shop && (
                <div className="flex items-center">
                  <Link to={`/shop/${artistData.shop}`} className="text-blue-500">
                    Working at: {artistData.shopName || 'Tattoo Shop'}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* View Mode Selector */}
      <div className="flex justify-between items-center p-4 border-b">
  <h2 className="text-lg font-medium">Portfolio</h2>
  <div className="flex bg-gray-100 rounded-lg p-1 mr-2">
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
      
      {/* No posts message */}
      {posts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500">No posts yet</p>
        </div>
      )}
      
      {/* Posts Grid */}
      {posts.length > 0 && (
        <div className={`grid ${
          viewMode === 'feed' 
            ? 'grid-cols-1 max-w-xl mx-auto gap-6 p-4' 
            : viewMode === 'grid3' 
              ? 'grid-cols-3 gap-1' 
              : 'grid-cols-5 gap-1'
        }`}>
          {posts.map(post => (
            <div key={post._id} className="relative group cursor-pointer">
              <img 
                src={`http://localhost:5000/${post.image}`} 
                alt={post.caption} 
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <div className="flex items-center mr-4">
                  <span className="mr-2">❤️</span> {post.likes.length}
                </div>
                <div className="flex items-center">
                  <span className="mr-2">💬</span> {post.comments.length}
                </div>
                
                {/* Delete post button - Only visible on own profile */}
                {isOwnProfile && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPost(post);
                      setShowDeleteConfirm(true);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-600 rounded-full hover:bg-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Delete Post Confirmation Modal */}
      {showDeleteConfirm && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center text-red-600 mb-4">
              <AlertTriangle size={24} className="mr-2" />
              <h2 className="text-xl font-bold">Delete Post</h2>
            </div>
            
            <p className="mb-4">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            
            <div className="mb-4 border rounded overflow-hidden">
              <img 
                src={`http://localhost:5000/${selectedPost.image}`}
                alt="Post to delete"
                className="w-full h-40 object-cover"
              />
            </div>
            
            {deleteError && (
              <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
                {deleteError}
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedPost(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="mr-2">Deleting...</span>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  </>
                ) : (
                  'Delete Post'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistProfile;