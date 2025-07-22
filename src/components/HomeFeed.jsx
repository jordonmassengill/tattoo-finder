import React, { useState, useEffect } from 'react';
import { BarChart2, LayoutGrid, Grid, Heart } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import ProfileImage from './ProfileImage';
import { useAuth } from '../context/AuthContext';

// --- Post Component (Now manages its own "like" state) ---
const Post = ({ post: initialPost, isGrid }) => {
  const { currentUser } = useAuth();
  
  // Each Post now has its own state for its like status and count
  const [post, setPost] = useState(initialPost);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialPost.likes.length);

  // This effect ensures the like button is correct when the component first loads or data changes
  useEffect(() => {
    if (currentUser) {
      setIsLiked(post.likes.some(likeId => likeId === currentUser.id));
    }
    setLikeCount(post.likes.length);
  }, [post.likes, currentUser]);

  const handleLikeToggle = async () => {
    if (!currentUser) {
      alert("Please log in to like posts.");
      return;
    }

    // Optimistically update UI for a snappy feel
    setIsLiked(!isLiked);
    setLikeCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);

    try {
      // Send the request to the backend
      const updatedPostData = isLiked 
        ? await api.unlikePost(post._id) 
        : await api.likePost(post._id);
      
      // Sync with the backend's response to ensure data is accurate
      setPost({ ...post, likes: updatedPostData.data });

    } catch (error) {
      console.error('Error toggling like:', error);
      // If the API call fails, revert the optimistic update
      setIsLiked(isLiked);
      setLikeCount(likeCount);
      alert("Failed to update like status. Please try again.");
    }
  };

  if (isGrid) {
    return (
      <div className="relative group cursor-pointer">
        <img 
          src={`http://localhost:5000/${post.image}`} 
          alt={post.caption} 
          className="w-full aspect-square object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
          <div className="flex items-center mr-4">
            <Heart size={20} className="mr-1 text-white" fill="white" /> {likeCount}
          </div>
          <div className="flex items-center">
            <span className="mr-2">💬</span> {post.comments.length}
          </div>
        </div>
        <Link to={`/artist/${post.user.username}`} className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100">
          {post.user.username}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-md mb-6">
      <div className="flex items-center p-3">
        <Link to={`/artist/${post.user.username}`} className="flex items-center">
          <ProfileImage user={post.user} size="md" />
          <div className="ml-3">
            <p className="font-semibold">{post.user.username}</p>
          </div>
        </Link>
      </div>
      
      <img 
        src={`http://localhost:5000/${post.image}`} 
        alt={post.caption} 
        className="w-full object-cover"
      />
      
      <div className="p-3">
        <div className="flex items-center mb-3 space-x-4">
          <button onClick={handleLikeToggle}>
            <Heart 
              className={`transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
              fill={isLiked ? 'currentColor' : 'none'}
            />
          </button>
          <button>💬</button>
          <button>🔖</button>
        </div>
        <p className="font-semibold mb-1">{likeCount} likes</p>
        <p>
          <Link to={`/artist/${post.user.username}`} className="font-semibold">{post.user.username}</Link> {post.caption}
        </p>
        <p className="text-gray-500 text-sm mt-1">
          View all {post.comments.length} comments
        </p>
        <p className="text-gray-400 text-xs mt-2">
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};


// --- HomeFeed Component (Now much simpler) ---
const HomeFeed = () => {
  const [viewMode, setViewMode] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await api.getPosts();
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);
  
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Feed</h2>
        <div className="flex bg-gray-100 rounded-lg p-1 mr-20">
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
      
      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {!loading && posts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500">Your feed is empty. Follow artists and shops to see their posts here!</p>
        </div>
      )}
      
      {!loading && viewMode === 'feed' && (
        <div className="max-w-xl mx-auto">
          {posts.map(post => (
            <Post key={post._id} post={post} isGrid={false} />
          ))}
        </div>
      )}
      
      {!loading && viewMode !== 'feed' && (
        <div className={`grid ${viewMode === 'grid3' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'} gap-1`}>
          {posts.map(post => (
            <Post key={post._id} post={post} isGrid={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeFeed;