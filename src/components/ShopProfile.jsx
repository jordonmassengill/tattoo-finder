import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LayoutGrid, Grid, BarChart2, MapPin, Phone, Clock, Tag, Trash2, Pencil, AlertTriangle, Heart, MessageCircle, Bookmark, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProfileImage from './ProfileImage';
import CommentModal from './CommentModal';
import EditPostModal from './EditPostModal';

// Sub-component to handle each post grid item
const PostGridItem = ({ post, isOwnPost, onPostClick, onDeleteClick, onEditClick }) => {
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
        src={`https://tattoo-finder-backend-production.up.railway.app/${post.image}`}
        alt={post.caption}
        className="w-full aspect-portrait object-cover"
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

        {isOwnPost && (
          <>
            <button onClick={onEditClick} className="absolute top-2 left-2 p-2 bg-blue-600 rounded-full hover:bg-blue-700">
              <Pencil size={16} />
            </button>
            <button onClick={onDeleteClick} className="absolute top-2 right-2 p-2 bg-red-600 rounded-full hover:bg-red-700">
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>

      {/* Artist attribution badge for grid view */}
      {post.user && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white text-xs truncate">@{post.user.username}</p>
        </div>
      )}
    </div>
  );
};

const formatNum = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
};

const ShopProfile = () => {
  const [viewMode, setViewMode] = useState('grid3');
  const [shopData, setShopData] = useState(null);
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
  const [postToEdit, setPostToEdit] = useState(null);

  // Affiliation state
  const [affiliationStatus, setAffiliationStatus] = useState(null); // 'none'|'pending_sent'|'pending_received'|'affiliated'
  const [affiliationRequestId, setAffiliationRequestId] = useState(null);
  const [affiliationLoading, setAffiliationLoading] = useState(false);

  const { id } = useParams();
  const { currentUser, userType } = useAuth();

  const isOwnProfile = currentUser && (currentUser.id === shopData?._id || currentUser.username === shopData?.username);

  useEffect(() => {
    const fetchShopData = async () => {
      if (!id) return;
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

        // Load posts — for shops include affiliated artists' posts
        const postsResponse = await api.getUserPosts(id, { includeArtists: true });
        setPosts(postsResponse.data);

        // Affiliation status for an artist viewing this shop
        if (currentUser && currentUser.userType === 'artist') {
          const shopId = profileData._id;
          const statusRes = await api.getAffiliationStatus(shopId);
          setAffiliationStatus(statusRes.data.status);
          setAffiliationRequestId(statusRes.data.requestId || null);
        }

      } catch (error) {
        console.error('Error fetching shop data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [id, currentUser?.id]);

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

  // --- Affiliation handlers ---

  const handleSendAffiliationRequest = async () => {
    setAffiliationLoading(true);
    try {
      const res = await api.sendAffiliationRequest(shopData._id);
      setAffiliationStatus('pending_sent');
      setAffiliationRequestId(res.data._id);
    } catch (error) {
      alert(error.response?.data?.message || 'Could not send request. Please try again.');
    } finally {
      setAffiliationLoading(false);
    }
  };

  const handleCancelAffiliationRequest = async () => {
    if (!affiliationRequestId) return;
    setAffiliationLoading(true);
    try {
      await api.declineAffiliationRequest(affiliationRequestId);
      setAffiliationStatus('none');
      setAffiliationRequestId(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Could not cancel request. Please try again.');
    } finally {
      setAffiliationLoading(false);
    }
  };

  const handleAcceptAffiliationRequest = async () => {
    if (!affiliationRequestId) return;
    setAffiliationLoading(true);
    try {
      await api.acceptAffiliationRequest(affiliationRequestId);
      setAffiliationStatus('affiliated');
      setAffiliationRequestId(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Could not accept request. Please try again.');
    } finally {
      setAffiliationLoading(false);
    }
  };

  const handleDeclineAffiliationRequest = async () => {
    if (!affiliationRequestId) return;
    setAffiliationLoading(true);
    try {
      await api.declineAffiliationRequest(affiliationRequestId);
      setAffiliationStatus('none');
      setAffiliationRequestId(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Could not decline request. Please try again.');
    } finally {
      setAffiliationLoading(false);
    }
  };

  const handleLeaveShop = async () => {
    if (!window.confirm('Are you sure you want to leave this shop?')) return;
    setAffiliationLoading(true);
    try {
      await api.removeAffiliation(shopData._id);
      setAffiliationStatus('none');
    } catch (error) {
      alert(error.response?.data?.message || 'Could not remove affiliation. Please try again.');
    } finally {
      setAffiliationLoading(false);
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
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Shop Not Found</h2>
          <p>The shop you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto pb-16">
      <div className="p-4 border-b dark:border-zinc-800">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <div className="w-28 h-28 md:w-36 md:h-36 flex-shrink-0 mb-4 md:mb-0 md:mr-8">
            <ProfileImage user={shopData} size="xl" className="w-full h-full" />
          </div>
          <div className="flex-grow text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:flex-wrap gap-2 mb-1">
              <h1 className="text-2xl font-bold mr-2 dark:text-gray-100">{shopData.username}</h1>
              {currentUser && !isOwnProfile && (
                <button
                  className={`${following ? 'bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200' : 'bg-blue-500 text-white'} px-4 py-2 rounded-md font-medium disabled:opacity-50`}
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                >
                  {isFollowLoading ? '...' : (following ? 'Following' : 'Follow Shop')}
                </button>
              )}

              {/* Compact affiliation buttons for artists viewing this shop */}
              {userType === 'artist' && !isOwnProfile && affiliationStatus === 'affiliated' && (
                <button onClick={handleLeaveShop} disabled={affiliationLoading} className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-full hover:bg-red-50 disabled:opacity-50">
                  {affiliationLoading ? '...' : 'Leave Shop'}
                </button>
              )}
              {userType === 'artist' && !isOwnProfile && affiliationStatus === 'pending_sent' && (
                <span className="flex items-center gap-1.5 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded-full text-xs">
                  <Clock size={12} className="text-yellow-600" />
                  <span className="text-yellow-700">Request Pending</span>
                  <button onClick={handleCancelAffiliationRequest} disabled={affiliationLoading} className="px-2 py-0.5 border border-gray-300 rounded-full hover:bg-gray-100">Cancel</button>
                </span>
              )}
              {userType === 'artist' && !isOwnProfile && affiliationStatus === 'pending_received' && (
                <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs">
                  <span className="text-blue-700 font-medium">Shop invited you</span>
                  <button onClick={handleAcceptAffiliationRequest} disabled={affiliationLoading} className="px-2 py-0.5 bg-blue-500 text-white rounded-full hover:bg-blue-600">Accept</button>
                  <button onClick={handleDeclineAffiliationRequest} disabled={affiliationLoading} className="px-2 py-0.5 border border-gray-300 rounded-full hover:bg-gray-100">Decline</button>
                </span>
              )}
              {userType === 'artist' && !isOwnProfile && affiliationStatus === 'none' && (
                <button onClick={handleSendAffiliationRequest} disabled={affiliationLoading} className="flex items-center px-3 py-1.5 text-xs bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50">
                  <UserPlus size={12} className="mr-1" />
                  {affiliationLoading ? '...' : 'Request to Join'}
                </button>
              )}

            </div>
            <div className="flex justify-center md:justify-start space-x-6 mb-1 dark:text-gray-300">
              <span><b>{followersCount}</b> followers</span>
              <span><b>{formatNum(posts.reduce((s, p) => s + (p.likes?.length || 0), 0))}</b> likes</span>
              <span><b>{formatNum(posts.reduce((s, p) => s + (p.comments?.length || 0), 0))}</b> comments</span>
            </div>
            <div className="mt-2 mb-2">
              <p className="whitespace-pre-wrap dark:text-gray-200">{shopData.bio}</p>
            </div>
            <div className="flex flex-col space-y-1 dark:text-gray-300">
              {shopData.location && (
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2" />
                  <span>{shopData.location}</span>
                </div>
              )}
              {shopData.phone && (
                <div className="flex items-center">
                  <Phone size={16} className="mr-2" />
                  <span>{shopData.phone}</span>
                </div>
              )}
              {shopData.hours && (
                <div className="flex items-center">
                  <Clock size={16} className="mr-2" />
                  <span>{shopData.hours}</span>
                </div>
              )}
              {shopData.website && (
                <div className="flex items-center">
                  <Tag size={16} className="mr-2" />
                  <a href={`https://${shopData.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-500">{shopData.website}</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center p-4 border-b dark:border-zinc-800">
        <div className="flex items-center gap-3 overflow-x-auto">
          {shopData.artists && shopData.artists.length > 0 && (
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0">Our Artists</span>
          )}
          {shopData.artists && shopData.artists.map(artist => (
            <Link key={artist._id} to={`/artist/${artist.username}`} className="flex flex-col items-center flex-shrink-0 hover:opacity-80 transition-opacity">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-0.5">
                <ProfileImage user={artist} size="lg" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 max-w-[3.5rem] truncate">{artist.username}</span>
            </Link>
          ))}
        </div>
        <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-lg p-1 mr-2">
          <button
            onClick={() => setViewMode('feed')}
            className={`p-2 rounded ${viewMode === 'feed' ? 'bg-white dark:bg-zinc-600 shadow' : 'dark:text-gray-300'}`}
          >
            <BarChart2 size={20} />
          </button>
          <button
            onClick={() => setViewMode('grid3')}
            className={`p-2 rounded mx-1 ${viewMode === 'grid3' ? 'bg-white dark:bg-zinc-600 shadow' : 'dark:text-gray-300'}`}
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode('grid5')}
            className={`p-2 rounded ${viewMode === 'grid5' ? 'bg-white dark:bg-zinc-600 shadow' : 'dark:text-gray-300'}`}
          >
            <Grid size={20} />
          </button>
        </div>
      </div>

      {posts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500 dark:text-gray-400">No posts yet</p>
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
              isOwnPost={currentUser && post.user?._id === currentUser.id}
              onPostClick={setSelectedPost}
              onEditClick={(e) => {
                e.stopPropagation();
                setPostToEdit(post);
              }}
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
          <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center text-red-600 mb-4">
              <AlertTriangle size={24} className="mr-2" />
              <h2 className="text-xl font-bold dark:text-gray-100">Delete Post</h2>
            </div>
            <p className="mb-4 dark:text-gray-200">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="mb-4 border dark:border-zinc-700 rounded overflow-hidden">
              <img
                src={`https://tattoo-finder-backend-production.up.railway.app/${postToDelete.image}`}
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
                className="px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800 dark:text-gray-200"
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

      {postToEdit && (
        <EditPostModal
          post={postToEdit}
          onClose={() => setPostToEdit(null)}
          onPostUpdated={(updatedPost) => {
            setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
          }}
        />
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

export default ShopProfile;
