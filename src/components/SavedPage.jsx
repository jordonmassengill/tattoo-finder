import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Search, Filter, Bookmark } from 'lucide-react';
import CommentModal from './CommentModal';
import { BAY_AREA_CITIES } from '../constants/locations';
import {
  COLOR_TYPES,
  FLASH_OR_CUSTOM,
  SIZES,
  FOUNDATIONAL_STYLES,
  TECHNIQUES,
  SUBJECTS,
} from '../constants/tattooCategories';
import { useAuth } from '../context/AuthContext';

const PostItem = ({ post, onPostClick }) => {
  const { currentUser, updateCurrentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [isSaved, setIsSaved] = useState(true);

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
    setLikeCount(prev => (originalIsLiked ? prev - 1 : prev + 1));
    try {
      await (originalIsLiked ? api.unlikePost(post._id) : api.likePost(post._id));
    } catch {
      setIsLiked(originalIsLiked);
      setLikeCount(prev => (originalIsLiked ? prev + 1 : prev - 1));
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
    } catch {
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
      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
        <div className="flex items-center text-lg font-bold">
          <button onClick={handleLikeToggle} className="flex items-center mr-5">
            <Heart size={22} className={`mr-1.5 transition-colors ${isLiked ? 'text-red-500' : 'text-white'}`} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{likeCount}</span>
          </button>
          <div className="flex items-center">
            <MessageCircle size={22} fill="currentColor" className="mr-1.5 text-white" />
            <span>{post.comments.length}</span>
          </div>
        </div>
        <button onClick={handleSaveToggle} className="absolute bottom-2 right-2 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition">
          <Bookmark size={20} className={`transition-colors ${isSaved ? 'text-blue-400' : 'text-white'}`} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
};

const EMPTY_FILTERS = {
  colorType: '',
  flashOrCustom: '',
  size: '',
  location: [],
  foundationalStyles: [],
  techniques: [],
  subjects: [],
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
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        setLoading(true);
        const response = await api.getSavedPosts();
        setSavedPosts(response.data);
        setFilteredPosts(response.data);
      } catch (error) {
        console.error('Error fetching saved posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedPosts();
  }, []);

  useEffect(() => {
    let posts = [...savedPosts];

    if (submittedQuery) {
      const q = submittedQuery.toLowerCase();
      posts = posts.filter(post =>
        post.caption?.toLowerCase().includes(q) ||
        post.user?.username?.toLowerCase().includes(q) ||
        post.tags?.some(tag => tag.toLowerCase().includes(q))
      );
    }
    if (filters.colorType) posts = posts.filter(p => p.colorType === filters.colorType);
    if (filters.flashOrCustom) posts = posts.filter(p => p.flashOrCustom === filters.flashOrCustom);
    if (filters.size) posts = posts.filter(p => p.size === filters.size);
    if (filters.location.length > 0) posts = posts.filter(p => p.user?.location && filters.location.includes(p.user.location));
    if (filters.foundationalStyles.length > 0) posts = posts.filter(p => p.foundationalStyles?.some(s => filters.foundationalStyles.includes(s)));
    if (filters.techniques.length > 0) posts = posts.filter(p => p.techniques?.some(t => filters.techniques.includes(t)));
    if (filters.subjects.length > 0) posts = posts.filter(p => p.subjects?.some(s => filters.subjects.includes(s)));

    if (sortOption === 'likes') {
      posts.sort((a, b) => b.likes.length - a.likes.length);
    } else {
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredPosts(posts);
  }, [submittedQuery, filters, sortOption, savedPosts]);

  const toggleSingle = (key, value) => setFilters(prev => ({ ...prev, [key]: prev[key] === value ? '' : value }));
  const toggleArray = (key, value) => setFilters(prev => ({
    ...prev,
    [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value],
  }));
  const resetFilters = () => { setFilters(EMPTY_FILTERS); setSearchQuery(''); setSubmittedQuery(''); };

  const activeFilterCount = [
    filters.colorType, filters.flashOrCustom, filters.size,
    ...filters.location, ...filters.foundationalStyles, ...filters.techniques, ...filters.subjects,
  ].filter(Boolean).length;

  const EitherOrRow = ({ label, options, filterKey }) => (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="flex gap-2">
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => toggleSingle(filterKey, opt)}
            className={`flex-1 py-1.5 text-sm rounded-full border font-medium transition-colors ${filters[filterKey] === opt ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  const ChipGroup = ({ label, options, filterKey }) => (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => toggleArray(filterKey, opt)}
            className={`px-2.5 py-1 text-xs rounded-full border font-medium transition-colors ${filters[filterKey].includes(opt) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

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
            onKeyDown={(e) => { if (e.key === 'Enter') setSubmittedQuery(searchQuery.trim()); }}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <button onClick={() => setSubmittedQuery(searchQuery.trim())}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600">
            Go
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-lg hover:bg-gray-200 transition ${activeFilterCount > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}>
            <Filter size={18} className="mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1.5 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
          <button onClick={() => setSortOption(prev => prev === 'newest' ? 'likes' : 'newest')}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium whitespace-nowrap">
            {sortOption === 'newest' ? 'Sort - New' : 'Sort - Likes'}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-5 mb-6 border border-gray-200">
          <h3 className="font-semibold mb-4 text-center">Filter Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {/* Left column */}
            <div>
              <EitherOrRow label="Color" options={COLOR_TYPES} filterKey="colorType" />
              <EitherOrRow label="Type" options={FLASH_OR_CUSTOM} filterKey="flashOrCustom" />
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Size</p>
                <div className="flex gap-2">
                  {SIZES.map(s => (
                    <button key={s} type="button" onClick={() => toggleSingle('size', s)}
                      className={`flex-1 py-1.5 text-sm rounded-full border font-medium transition-colors ${filters.size === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</p>
                <div className="grid grid-cols-2 gap-x-2">
                  {BAY_AREA_CITIES.map(city => (
                    <label key={city} className="flex items-center text-sm py-0.5 px-1 hover:bg-gray-100 rounded cursor-pointer">
                      <input type="checkbox" checked={filters.location.includes(city)} onChange={() => toggleArray('location', city)} className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600" />
                      {city}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {/* Right column */}
            <div>
              <ChipGroup label="Foundational Style" options={FOUNDATIONAL_STYLES} filterKey="foundationalStyles" />
              <ChipGroup label="Technique / Finish" options={TECHNIQUES} filterKey="techniques" />
              <ChipGroup label="Subject" options={SUBJECTS} filterKey="subjects" />
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
          <p className="text-gray-400 mt-2">Try adjusting your search or click Reset.</p>
        </div>
      )}
      {!loading && filteredPosts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredPosts.map(post => (
            <PostItem key={post._id} post={post} onPostClick={setSelectedPost} />
          ))}
        </div>
      )}
      {selectedPost && (
        <CommentModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
};

export default SavedPage;
