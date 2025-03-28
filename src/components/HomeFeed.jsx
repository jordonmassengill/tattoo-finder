// src/components/HomeFeed.jsx
import React, { useState, useEffect } from 'react';
import { BarChart2, LayoutGrid, Grid } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const HomeFeed = () => {
  const [viewMode, setViewMode] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch posts from API
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
  
  useEffect(() => {
    fetchPosts();
  }, []);
  
  // Handle like button click
  const handleLike = async (postId) => {
    try {
      await api.likePost(postId);
      // Refresh posts after liking
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // In src/components/HomeFeed.jsx, update the Post component:

const Post = ({ post, isGrid }) => {
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
            <span className="mr-2">❤️</span> {post.likes.length}
          </div>
          <div className="flex items-center">
            <span className="mr-2">💬</span> {post.comments.length}
          </div>
        </div>
        <Link to={`/artist/${post.user._id}`} className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100">
          {post.user.username}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-md mb-6">
      {/* Post Header - Make this clickable */}
      <div className="flex items-center p-3">
        <Link to={`/artist/${post.user._id}`} className="flex items-center">
          <img 
            src={`http://localhost:5000/${post.user.profilePic}`} 
            alt={post.user.username} 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="ml-3">
            <p className="font-semibold">{post.user.username}</p>
          </div>
        </Link>
      </div>
      
      {/* Post Image */}
      <img 
        src={`http://localhost:5000/${post.image}`} 
        alt={post.caption} 
        className="w-full object-cover"
      />
      
      {/* Post Actions */}
      <div className="p-3">
        <div className="flex items-center mb-3">
          <button className="mr-4" onClick={() => handleLike(post._id)}>❤️</button>
          <button className="mr-4">💬</button>
          <button>🔖</button>
        </div>
        <p className="font-semibold mb-1">{post.likes.length} likes</p>
        <p>
          <Link to={`/artist/${post.user._id}`} className="font-semibold">{post.user.username}</Link> {post.caption}
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
  
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      {/* View Mode Selector */}
      <div className="flex justify-end mb-6">
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
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500">No posts found. Follow artists to see their work here!</p>
        </div>
      )}
      
      {/* Feed View */}
      {!loading && viewMode === 'feed' && (
        <div className="max-w-xl mx-auto">
          {posts.map(post => (
            <Post key={post._id} post={post} isGrid={false} />
          ))}
        </div>
      )}
      
      {/* Grid Views */}
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