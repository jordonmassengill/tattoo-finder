import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Search, Filter, Bookmark } from 'lucide-react';
import CommentModal from './CommentModal';
import { BAY_AREA_CITIES } from '../constants/locations';
import { useAuth } from '../context/AuthContext';

// New sub-component to handle each post's state and actions
const PostItem = ({ post, onPostClick }) => {
  const { currentUser, updateCurrentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [isSaved, setIsSaved] = useState(true); // Default to true since these are saved posts

  useEffect(() => {
    if (currentUser) {
      setIsLiked(post.likes.includes(currentUser.id));
      // Also check the global state in case it has been unsaved without a refresh
      setIsSaved(currentUser.savedPosts?.includes(post._id));
    }
    setLikeCount(post.likes.length);
  }, [currentUser, post]);

  const handleLikeToggle = async (e) => {
    e.stopPropagation();
    if (!currentUser) return;

    const originalIsLiked = isLiked;
    setIsLiked(!originalIsLiked);
    setLikeCount(prev => (originalIsLiked ? prev - 1 : prev + 1));

    try {
      await (originalIsLiked ? api.unlikePost(post._id) : api.likePost(post._id));
    } catch (error) {
      console.error("Error toggling like:", error);
      setIsLiked(originalIsLiked);
      setLikeCount(prev => (originalIsLiked ? prev + 1 : prev - 1));
    }
  };

  const handleSaveToggle = async (e) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    const originalIsSaved = isSaved;
    setIsSaved(!originalIsSaved); // Optimistically update the icon

    try {
      const response = await (originalIsSaved ? api.unsavePost(post._id) : api.savePost(post._id));
      updateCurrentUser({ ...currentUser, savedPosts: response.data.savedPosts });
    } catch (error) {
      console.error("Error toggling save:", error);
      setIsSaved(originalIsSaved); // Revert icon on failure
    }
  };

  return (
    <div className="relative group cursor-pointer" onClick={() => onPostClick(post)}>
      <img
        src={`http://localhost:5000/${post.image}`}
        alt={post.caption}
        className="w-full aspect-square object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
        <div className="flex items-center text-lg font-bold">
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
        </div>
        <button onClick={handleSaveToggle} className="absolute bottom-2 right-2 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition">
          <Bookmark
            size={20}
            className={`transition-colors ${isSaved ? 'text-blue-400' : 'text-white'}`}
            fill={isSaved ? 'currentColor' : 'none'}
          />
        </button>
      </div>
    </div>
  );
};


const SavedPage = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [filters, setFilters] = useState({
    location: [],
    styles: [],
  });
  
  const tattooStyles = [
    'Geometric', 'Blackwork', 'Minimalist', 'Watercolor', 'Illustrative',
    'Traditional', 'Neo-Traditional', 'Japanese', 'Irezumi', 'Realism',
    'Portrait', 'Tribal', 'Dotwork', 'Linework', 'Mandala', 'Sci-Fi',
    'Abstract', 'Floral', 'American Traditional', 'Black and Grey'
  ];

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        setLoading(true);
        const response = await api.getSavedPosts();
        setSavedPosts(response.data);
        setFilteredPosts(response.data);
      } catch (error) {
        console.error("Error fetching saved posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedPosts();
  }, []);

  useEffect(() => {
    let posts = [...savedPosts];

    if (submittedQuery) {
      const lowercasedQuery = submittedQuery.toLowerCase();
      posts = posts.filter(post =>
        post.caption.toLowerCase().includes(lowercasedQuery) ||
        post.user.username.toLowerCase().includes(lowercasedQuery) ||
        post.tags?.some(tag => tag.toLowerCase().includes(lowercasedQuery))
      );
    }

    if (filters.styles.length > 0) {
      posts = posts.filter(post =>
        post.styles?.some(style => filters.styles.includes(style))
      );
    }
    
    if (filters.location.length > 0) {
        posts = posts.filter(post => 
            post.user.location && filters.location.includes(post.user.location)
        );
    }

    if (sortOption === 'likes') {
      posts.sort((a, b) => b.likes.length - a.likes.length);
    } else {
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredPosts(posts);
  }, [submittedQuery, filters, sortOption, savedPosts]);

  const toggleFilter = (category, value) => {
    setFilters(prev => {
        const newValues = prev[category].includes(value)
            ? prev[category].filter(item => item !== value)
            : [...prev[category], value];
        return { ...prev, [category]: newValues };
    });
  };

  const resetFilters = () => {
    setFilters({ location: [], styles: [] });
    setSearchQuery('');
    setSubmittedQuery('');
    setSortOption('newest');
  };

  const handleSearchSubmit = () => {
    setSubmittedQuery(searchQuery.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Your Saved Posts</h1>
      
      <div className="flex flex-col md:flex-row items-center mb-6">
        <div className="relative flex-grow w-full mb-4 md:mb-0 md:mr-4">
            <input
                type="text"
                placeholder="Search in saved posts..."
                className="w-full pl-10 pr-24 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <button
                onClick={handleSearchSubmit}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
                Go
            </button>
        </div>
        <div className="flex items-center space-x-2">
            <button 
                onClick={() => setShowFilters(!showFilters)} 
                className="flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                <Filter size={18} className="mr-2" /> Filters
            </button>
            <button 
                onClick={() => setSortOption(prev => prev === 'newest' ? 'likes' : 'newest')} 
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium whitespace-nowrap">
                {sortOption === 'newest' ? 'Sort: Newest' : 'Sort: Most Liked'}
            </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block mb-2 font-medium">Tattoo Style</label>
                    <div className="pr-2 max-h-48 overflow-y-auto border rounded p-2 bg-white grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {tattooStyles.map(style => (
                            <label key={style} className="flex items-center text-sm py-1 px-1 hover:bg-gray-100 rounded">
                                <input type="checkbox" checked={filters.styles.includes(style)} onChange={() => toggleFilter('styles', style)} className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                {style}
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block mb-2 font-medium">Location</label>
                    <div className="pr-2 max-h-48 overflow-y-auto border rounded p-2 bg-white">
                        {BAY_AREA_CITIES.map(city => (
                            <label key={city} className="flex items-center text-sm py-1 px-1 hover:bg-gray-100 rounded">
                                <input type="checkbox" checked={filters.location.includes(city)} onChange={() => toggleFilter('location', city)} className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                {city}
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
                <button className="px-4 py-2 text-sm rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400" onClick={resetFilters}>Reset</button>
                <button className="px-4 py-2 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600" onClick={() => setShowFilters(false)}>Apply</button>
            </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      {!loading && savedPosts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500">You haven't saved any posts yet.</p>
          <p className="text-gray-400 mt-2">Click the bookmark icon on a post to save it here.</p>
        </div>
      )}
      {!loading && savedPosts.length > 0 && filteredPosts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500">No saved posts match your filters.</p>
          <p className="text-gray-400 mt-2">Try adjusting your search or click "Reset" in the filter panel.</p>
        </div>
      )}
      {!loading && filteredPosts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredPosts.map((post) => (
            <PostItem key={post._id} post={post} onPostClick={setSelectedPost} />
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

export default SavedPage;