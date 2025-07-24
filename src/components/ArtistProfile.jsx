import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LayoutGrid, Grid, BarChart2, MapPin, DollarSign, Tag, Trash2, AlertTriangle, Heart, MessageCircle, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProfileImage from './ProfileImage';
import CommentModal from './CommentModal';

// Sub-component to handle each post grid item
const PostGridItem = ({ post, isOwnProfile, onPostClick, onDeleteClick }) => {
  const { currentUser, updateCurrentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setIsLiked(post.likes.includes(currentUser.id));
      setIsSaved(currentUser.savedPosts?.includes(post._id));
    }
    setLikeCount(post.likes.length);
  }, [currentUser, post]);

  const handleLikeToggle = async (e) => {
    e.stopPropagation();
    if (!currentUser) return;

    const originalIsLiked = isLiked;
    setIsLiked(!originalIsLiked);
    setLikeCount(prev => originalIsLiked ? prev - 1 : prev + 1);

    try {
      await (originalIsLiked ? api.unlikePost(post._id) : api.likePost(post._id));
    } catch (error) {
      console.error("Error toggling like:", error);
      setIsLiked(originalIsLiked);
      setLikeCount(prev => originalIsLiked ? prev + 1 : prev - 1);
    }
  };

  const handleSaveToggle = async (e) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    const originalIsSaved = isSaved;
    setIsSaved(!originalIsSaved);

    try {
      const response = await (originalIsSaved ? api.unsavePost(post._id) : api.savePost(post._id));
      updateCurrentUser({ ...currentUser, savedPosts: response.data.savedPosts });
    } catch (error) {
      console.error("Error toggling save:", error);
      setIsSaved(originalIsSaved);
    }
  };

  return (
    <div className="relative group cursor-pointer" onClick={() => onPostClick(post)}>
      <img
        src={`http://localhost:5000/${post.image}`}
        alt={post.caption}
        className="w-full aspect-square object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-lg font-bold">
        <button onClick={handleLikeToggle} className="flex items-center mr-5">
          <Heart 
            size={22}
            className={`mr-1.5 transition-colors ${isLiked ? 'text-red-500' : 'text-white'}`}
            fill={isLiked ? 'currentColor' : 'none'}
          />
          <span>{likeCount}</span>
        </button>
        <div className="flex items-center">
          <MessageCircle size={22} fill="currentColor" className="mr-1.5 text-white" />
          <span>{post.comments.length}</span>
        </div>

        {currentUser && (
          <button onClick={handleSaveToggle} className="absolute bottom-2 right-2 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition">
            <Bookmark
              size={20}
              className={`transition-colors ${isSaved ? 'text-blue-400' : 'text-white'}`}
              fill={isSaved ? 'currentColor' : 'none'}
            />
          </button>
        )}
        
        {isOwnProfile && (
          <button onClick={onDeleteClick} className="absolute top-2 right-2 p-2 bg-red-600 rounded-full hover:bg-red-700">
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};


const ArtistProfile = () => {
  const [viewMode, setViewMode] = useState('grid3');
  const [artistData, setArtistData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  
  const { id } = useParams();
  const { currentUser } = useAuth();
  
  const isOwnProfile = currentUser && (currentUser.id === artistData?._id || currentUser.username === artistData?.username);
  
  useEffect(() => {
    const fetchArtistData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const profileResponse = await api.getUserById(id);
        const artistData = profileResponse.data;
        
        setArtistData(artistData);
        setFollowersCount(artistData.followers?.length || 0);
        
        if (currentUser && artistData.followers) {
          const isUserFollowing = artistData.followers.some(followerId => followerId.toString() === currentUser.id);
          setFollowing(isUserFollowing);
        }
        
        const postsResponse = await api.getUserPosts(id);
        setPosts(postsResponse.data);
        
      } catch (error) {
        console.error('Error fetching artist data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArtistData();
  }, [id, currentUser?.id]);
  
  const handleFollowToggle = async () => {
    if (!currentUser) return;
    
    setIsFollowLoading(true);
    
    try {
      if (following) {
        await api.unfollowUser(artistData._id);
        setFollowersCount(prev => prev - 1);
        setFollowing(false);
      } else {
        await api.followUser(artistData._id);
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
  
  const handleDeletePost = async () => {
    if (!postToDelete) return;

    setIsDeleting(true);
    setDeleteError('');

    try {
      await api.deletePost(postToDelete._id);
    
      setPosts(posts.filter(post => post._id !== postToDelete._id));
      setPostToDelete(null);
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
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <div className="w-28 h-28 md:w-36 md:h-36 flex-shrink-0 mb-4 md:mb-0 md:mr-8">
            <ProfileImage user={artistData} size="xl" className="w-full h-full" />
          </div>
          <div className="flex-grow text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center mb-4">
              <h1 className="text-2xl font-bold mr-4">{artistData.username}</h1>
              {currentUser && !isOwnProfile && (
                <button 
                  className={`${following ? 'bg-gray-200 text-gray-800' : 'bg-blue-500 text-white'} px-4 py-2 rounded-md font-medium mt-2 md:mt-0 disabled:opacity-50`}
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                >
                  {isFollowLoading ? '...' : (following ? 'Following' : 'Follow Artist')}
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
      
      {posts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500">No posts yet</p>
        </div>
      )}
      
      {posts.length > 0 && (
        <div className={`grid ${
          viewMode === 'feed' 
            ? 'grid-cols-1 max-w-xl mx-auto gap-6 p-4' 
            : viewMode === 'grid3' 
            ? 'grid-cols-3 gap-1' 
            : 'grid-cols-5 gap-1'
        }`}>
          {posts.map(post => (
            <PostGridItem
              key={post._id}
              post={post}
              isOwnProfile={isOwnProfile}
              onPostClick={setSelectedPost}
              onDeleteClick={(e) => {
                e.stopPropagation();
                setPostToDelete(post);
                setShowDeleteConfirm(true);
              }}
            />
          ))}
        </div>
      )}
      
      {showDeleteConfirm && postToDelete && (
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
                src={`http://localhost:5000/${postToDelete.image}`}
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
                  setPostToDelete(null);
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

      {selectedPost && (
        <CommentModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
};

export default ArtistProfile;