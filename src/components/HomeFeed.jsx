// File: src/components/HomeFeed.jsx

import React, { useState, useEffect } from 'react';
import { BarChart2, LayoutGrid, Grid, Heart, MessageCircle, Bookmark } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import ProfileImage from './ProfileImage';
import { useAuth } from '../context/AuthContext';
import CommentModal from './CommentModal';

const profileUrl = (user) => {
  if (!user?.username) return '/';
  return user.userType === 'shop' ? `/shop/${user.username}` : `/artist/${user.username}`;
};

const Post = ({ post: initialPost, isGrid, onCommentClick }) => {
  const { currentUser, updateCurrentUser } = useAuth();
  
  const [post, setPost] = useState(initialPost);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialPost.likes.length);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setIsLiked(post.likes.some(likeId => likeId === currentUser.id));
      setIsSaved(currentUser.savedPosts?.includes(post._id));
    }
    setLikeCount(post.likes.length);
  }, [post, currentUser]);

  const handleLikeToggle = async (e) => {
    e.stopPropagation(); // Prevent modal from opening
    if (!currentUser) {
      alert("Please log in to like posts.");
      return;
    }

    const originalIsLiked = isLiked;
    setIsLiked(!isLiked);
    setLikeCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);

    try {
      const updatedPostData = isLiked 
        ? await api.unlikePost(post._id) 
        : await api.likePost(post._id);
      setPost({ ...post, likes: updatedPostData.data });
    } catch (error) {
      console.error('Error toggling like:', error);
      setIsLiked(originalIsLiked);
      setLikeCount(likeCount);
      alert("Failed to update like status. Please try again.");
    }
  };

  const handleSaveToggle = async (e) => {
    e.stopPropagation(); // Prevent modal from opening
    if (!currentUser) return;

    const originalSavedState = isSaved;
    setIsSaved(!originalSavedState);

    try {
      const apiCall = originalSavedState ? api.unsavePost : api.savePost;
      const response = await apiCall(post._id);
      updateCurrentUser({ ...currentUser, savedPosts: response.data.savedPosts });
    } catch (error) {
      console.error('Error toggling save:', error);
      setIsSaved(originalSavedState);
      alert("Failed to update saved status. Please try again.");
    }
  };

  if (isGrid) {
    return (
      <div className="relative group cursor-pointer" onClick={() => onCommentClick(post)}>
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
            <button
              onClick={handleSaveToggle}
              className="absolute bottom-2 right-2 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition"
              aria-label="Save post"
            >
              <Bookmark
                className={`transition-colors ${isSaved ? 'text-blue-400' : 'text-white'}`}
                fill={isSaved ? 'currentColor' : 'none'}
                size={20}
              />
            </button>
          )}
          
          <Link to={profileUrl(post.user)} onClick={(e) => e.stopPropagation()} className="absolute bottom-2 left-2 text-sm font-medium hover:underline bg-black/50 px-2 py-1 rounded">
            {post.user.username}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md mb-6">
      <div className="flex items-center p-2">
        <Link to={profileUrl(post.user)} className="flex items-center">
          <ProfileImage user={post.user} size="md" />
          <div className="ml-3">
            <p className="font-semibold dark:text-gray-100">{post.user.username}</p>
          </div>
        </Link>
      </div>

      <img
        src={`http://localhost:5000/${post.image}`}
        alt={post.caption}
        className="w-full aspect-portrait object-cover"
      />

      <div className="px-2 py-1">
        <div className="flex items-center my-1 space-x-4 h-10">
          <button onClick={handleLikeToggle}>
            <Heart
              className={`transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}
              fill={isLiked ? 'currentColor' : 'none'}
            />
          </button>
          <button onClick={() => onCommentClick(post)}>
            <MessageCircle className="text-gray-500 dark:text-gray-400" />
          </button>
          <button onClick={handleSaveToggle}>
            <Bookmark
              className={`transition-colors ${isSaved ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
              fill={isSaved ? 'currentColor' : 'none'}
            />
          </button>
        </div>
        <p className="font-semibold mb-1 dark:text-gray-100">{likeCount} likes</p>
        <p className="dark:text-gray-200">
          <Link to={profileUrl(post.user)} className="font-semibold dark:text-gray-100">{post.user.username}</Link> {post.caption}
        </p>
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs text-blue-500">#{tag}</span>
            ))}
          </div>
        )}
        <button onClick={() => onCommentClick(post)} className="text-gray-500 dark:text-gray-400 text-sm mt-1 hover:underline">
          View all {post.comments.length} comments
        </button>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

const HomeFeed = () => {
  const [viewMode, setViewMode] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  
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
        <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-lg p-1 mr-20">
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
      
      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {!loading && posts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500 dark:text-gray-400">Your feed is empty. Follow artists and shops to see their posts here!</p>
        </div>
      )}
      
      {!loading && viewMode === 'feed' && (
        <div className="max-w-xl mx-auto">
          {posts.map(post => (
            <Post 
              key={post._id} 
              post={post} 
              isGrid={false} 
              onCommentClick={(p) => setSelectedPost(p)}
            />
          ))}
        </div>
      )}
      
      {!loading && viewMode !== 'feed' && (
        <div className={`grid ${viewMode === 'grid3' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'} gap-1`}>
          {posts.map(post => (
            <Post 
              key={post._id} 
              post={post} 
              isGrid={true} 
              onCommentClick={(p) => setSelectedPost(p)}
            />
          ))}
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

export default HomeFeed;