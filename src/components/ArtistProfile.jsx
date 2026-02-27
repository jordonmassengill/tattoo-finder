import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LayoutGrid, Grid, BarChart2, MapPin, Star, Trash2, AlertTriangle, Heart, MessageCircle, Bookmark, UserPlus, UserCheck, Clock as ClockIcon } from 'lucide-react';
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

  // Affiliation state
  const [affiliationStatus, setAffiliationStatus] = useState(null); // 'none'|'pending_sent'|'pending_received'|'affiliated'
  const [affiliationRequestId, setAffiliationRequestId] = useState(null);
  const [affiliationLoading, setAffiliationLoading] = useState(false);

  const { id } = useParams();
  const { currentUser } = useAuth();

  const isOwnProfile = currentUser && (currentUser.id === artistData?._id || currentUser.username === artistData?.username);

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const profileResponse = await api.getUserById(id);
        const data = profileResponse.data;

        setArtistData(data);
        setFollowersCount(data.followers?.length || 0);

        if (currentUser && data.followers) {
          const isUserFollowing = data.followers.some(followerId => followerId.toString() === currentUser.id);
          setFollowing(isUserFollowing);
        }

        const postsResponse = await api.getUserPosts(id);
        setPosts(postsResponse.data);

        // Affiliation status for a shop viewing this artist
        if (currentUser && currentUser.userType === 'shop') {
          const artistId = data._id;
          const statusRes = await api.getAffiliationStatus(artistId);
          setAffiliationStatus(statusRes.data.status);
          setAffiliationRequestId(statusRes.data.requestId || null);
        }

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

  // --- Affiliation handlers (shop-side) ---

  const handleSendAffiliationRequest = async () => {
    setAffiliationLoading(true);
    try {
      const res = await api.sendAffiliationRequest(artistData._id);
      setAffiliationStatus('pending_sent');
      setAffiliationRequestId(res.data._id);
    } catch (error) {
      alert(error.response?.data?.message || 'Could not send invitation. Please try again.');
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
      alert(error.response?.data?.message || 'Could not cancel invitation. Please try again.');
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

  const handleRemoveFromShop = async () => {
    if (!window.confirm('Remove this artist from your shop?')) return;
    setAffiliationLoading(true);
    try {
      await api.removeAffiliation(artistData._id);
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

  // shop link — shop field is now a populated object { _id, username, profilePic }
  const shopId = artistData.shop?._id || artistData.shop;
  const shopName = artistData.shop?.username || null;

  // Affiliation button shown to a logged-in shop viewing this artist profile
  const renderAffiliationButton = () => {
    if (!currentUser || currentUser.userType !== 'shop' || isOwnProfile) return null;

    // Artist already belongs to a different shop — no action available
    if (artistData.shop && affiliationStatus !== 'affiliated') {
      return (
        <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-md font-medium mt-2 md:mt-0 text-sm">
          Already at a shop
        </span>
      );
    }

    if (affiliationStatus === 'affiliated') {
      return (
        <button
          onClick={handleRemoveFromShop}
          disabled={affiliationLoading}
          className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium mt-2 md:mt-0 hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50"
        >
          <UserCheck size={16} className="mr-2" />
          {affiliationLoading ? '...' : 'Remove from Shop'}
        </button>
      );
    }

    if (affiliationStatus === 'pending_sent') {
      return (
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <span className="flex items-center px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md font-medium text-sm">
            <ClockIcon size={14} className="mr-1.5" />
            Invitation Pending
          </span>
          <button
            onClick={handleCancelAffiliationRequest}
            disabled={affiliationLoading}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      );
    }

    if (affiliationStatus === 'pending_received') {
      return (
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <span className="text-sm text-gray-600">Artist requested to join:</span>
          <button
            onClick={handleAcceptAffiliationRequest}
            disabled={affiliationLoading}
            className="px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            Accept
          </button>
          <button
            onClick={handleDeclineAffiliationRequest}
            disabled={affiliationLoading}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Decline
          </button>
        </div>
      );
    }

    // status === 'none' and artist has no current shop
    return (
      <button
        onClick={handleSendAffiliationRequest}
        disabled={affiliationLoading}
        className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md font-medium mt-2 md:mt-0 hover:bg-green-600 disabled:opacity-50"
      >
        <UserPlus size={16} className="mr-2" />
        {affiliationLoading ? '...' : 'Invite to Shop'}
      </button>
    );
  };

  return (
    <div className="max-w-screen-xl mx-auto pb-16">
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-40 h-40 md:w-52 md:h-52 flex-shrink-0 mb-4 md:mb-0 md:mr-8">
            <ProfileImage user={artistData} size="xl" className="w-full h-full" />
          </div>
          <div className="flex-grow text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:flex-wrap gap-2 mb-1">
              <h1 className="text-2xl font-bold mr-2">{artistData.username}</h1>
              {currentUser && !isOwnProfile && (
                <button
                  className={`${following ? 'bg-gray-200 text-gray-800' : 'bg-blue-500 text-white'} px-4 py-2 rounded-md font-medium disabled:opacity-50`}
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                >
                  {isFollowLoading ? '...' : (following ? 'Following' : 'Follow Artist')}
                </button>
              )}
              {renderAffiliationButton()}
            </div>
            <div className="flex justify-center md:justify-start space-x-6 mb-1">
              <span><b>{posts.length}</b> posts</span>
              <span><b>{followersCount}</b> followers</span>
              <span><b>{artistData.following?.length || 0}</b> following</span>
            </div>
            <div className="mt-2 mb-2">
              <p>{artistData.bio}</p>
            </div>
            <div className="flex flex-col space-y-1">
              {(artistData.location || artistData.priceRange) && (
                <div className="flex items-center gap-1.5">
                  {artistData.priceRange && <span>{artistData.priceRange}</span>}
                  {artistData.location && (
                    <>
                      <MapPin size={14} />
                      <span>{artistData.location}</span>
                    </>
                  )}
                </div>
              )}

              {/* Specialty badges — hide "I Do Both Equally" */}
              {((artistData.inkSpecialty && artistData.inkSpecialty !== 'I Do Both Equally') ||
                (artistData.designSpecialty && artistData.designSpecialty !== 'I Do Both Equally')) && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {artistData.inkSpecialty && artistData.inkSpecialty !== 'I Do Both Equally' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                      <Star size={10} fill="currentColor" /> {artistData.inkSpecialty}
                    </span>
                  )}
                  {artistData.designSpecialty && artistData.designSpecialty !== 'I Do Both Equally' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                      <Star size={10} fill="currentColor" /> {artistData.designSpecialty}
                    </span>
                  )}
                </div>
              )}

              {/* Style chips — specialties first (amber), then others (light blue) */}
              {[
                { specialties: artistData.foundationalStyleSpecialties, all: artistData.foundationalStyles, label: 'Style' },
                { specialties: artistData.techniqueSpecialties, all: artistData.techniques, label: 'Technique' },
                { specialties: artistData.subjectSpecialties, all: artistData.subjects, label: 'Subject' },
              ].map(({ specialties = [], all = [], label }) => {
                if (!all || all.length === 0) return null;
                const stars = all.filter(item => specialties.includes(item));
                const rest = all.filter(item => !specialties.includes(item));
                const ordered = [...stars, ...rest];
                return (
                  <div key={label} className="mt-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wide mr-1">{label}:</span>
                    <span className="inline-flex flex-wrap gap-1">
                      {ordered.map(item => {
                        const isStar = specialties.includes(item);
                        return (
                          <span key={item} className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${isStar ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'}`}>
                            {isStar && <Star size={9} fill="currentColor" />}
                            {item}
                          </span>
                        );
                      })}
                    </span>
                  </div>
                );
              })}

            </div>

          </div>
        </div>
      </div>

      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-3">
          {shopId && (
            <>
              <span className="text-sm font-semibold text-gray-500 flex-shrink-0">My Shop</span>
              <Link to={`/shop/${shopId}`} className="flex flex-col items-center flex-shrink-0 hover:opacity-80 transition-opacity">
                <div className="w-16 h-16 rounded-full overflow-hidden mb-0.5">
                  <ProfileImage user={artistData.shop} size="lg" />
                </div>
                <span className="text-xs text-gray-600 max-w-[4rem] truncate">{shopName || 'Tattoo Shop'}</span>
              </Link>
            </>
          )}
        </div>
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
