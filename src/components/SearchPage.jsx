import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Filter, Users, Image, Heart, MessageCircle, Search, Bookmark, BarChart2, LayoutGrid, Grid } from 'lucide-react';
import ProfileImage from './ProfileImage';
import { BAY_AREA_CITIES } from '../constants/locations';
import {
  COLOR_TYPES,
  SIZES,
  STYLES,
  SUBJECTS,
} from '../constants/tattooCategories';
import CommentModal from './CommentModal';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const profileUrl = (user) => {
  if (!user?.username) return '/';
  return user.userType === 'shop' ? `/shop/${user.username}` : `/artist/${user.username}`;
};

const formatNum = (n) => {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
};

// Sub-component to handle each post's state and actions
const PostItem = ({ post, onCommentClick }) => {
  const { currentUser, updateCurrentUser } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes.length);

  useEffect(() => {
    if (currentUser) {
      setIsSaved(currentUser.savedPosts?.includes(post._id));
      setIsLiked(post.likes.includes(currentUser.id));
    }
    setLikeCount(post.likes.length);
  }, [currentUser, post]);

  const handleLikeToggle = async (e) => {
    e.stopPropagation();
    if (!currentUser) { alert("Please log in to like posts."); return; }
    const originalIsLiked = isLiked;
    setIsLiked(!originalIsLiked);
    setLikeCount(prev => originalIsLiked ? prev - 1 : prev + 1);
    try {
      const apiCall = originalIsLiked ? api.unlikePost : api.likePost;
      await apiCall(post._id);
    } catch {
      setIsLiked(originalIsLiked);
      setLikeCount(prev => originalIsLiked ? prev + 1 : prev - 1);
      alert("Failed to update like status. Please try again.");
    }
  };

  const handleSaveToggle = async (e) => {
    e.stopPropagation();
    if (!currentUser) return;
    const originalSavedState = isSaved;
    setIsSaved(!originalSavedState);
    try {
      const apiCall = originalSavedState ? api.unsavePost : api.savePost;
      const response = await apiCall(post._id);
      updateCurrentUser({ ...currentUser, savedPosts: response.data.savedPosts });
    } catch {
      setIsSaved(originalSavedState);
      alert("Failed to update saved status. Please try again.");
    }
  };

  return (
    <div className="relative group cursor-pointer" onClick={() => onCommentClick(post)}>
      <img src={`http://localhost:5000/${post.image}`} alt={post.caption} className="w-full aspect-portrait object-cover rounded-lg" />
      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white p-2 rounded-lg">
        <div className="flex items-center text-lg font-bold">
          <button onClick={handleLikeToggle} className="flex items-center mr-5">
            <Heart size={22} className={`mr-1.5 transition-colors ${isLiked ? 'text-red-500' : 'text-white'}`} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{likeCount}</span>
          </button>
          <div className="flex items-center" onClick={() => onCommentClick(post)}>
            <MessageCircle size={22} fill="currentColor" className="mr-1.5 text-white" />
            <span>{post.comments.length}</span>
          </div>
        </div>
        {currentUser && (
          <button onClick={handleSaveToggle} className="absolute bottom-2 right-2 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition" aria-label="Save post">
            <Bookmark className={`transition-colors ${isSaved ? 'text-blue-400' : 'text-white'}`} fill={isSaved ? 'currentColor' : 'none'} size={20} />
          </button>
        )}
        <Link to={profileUrl(post.user)} onClick={(e) => e.stopPropagation()} className="absolute bottom-2 left-2 text-sm font-medium hover:underline bg-black/50 px-2 py-1 rounded">
          by {post.user.username}
        </Link>
      </div>
    </div>
  );
};

const EMPTY_FILTERS = {
  location: [],
  priceRange: [],
  colorType: '',
  flashType: '',
  size: '',
  styles: [],
  subjects: [],
  // Artist-only filters
  inkSpecialty: '',
  designSpecialty: '',
  styleSpecialties: [],
  subjectSpecialties: [],
};

const SearchPage = () => {
  const [viewMode, setViewMode] = useState('grid3');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [searchType, setSearchType] = useState('posts');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (submittedQuery) params.append('query', submittedQuery);
        filters.location.forEach(loc => params.append('location', loc));
        params.append('sort', sortOption);

        if (searchType === 'posts') {
          filters.priceRange.forEach(price => params.append('priceRange', price));
          if (filters.colorType) params.append('colorType', filters.colorType);
          if (filters.flashType) params.append('flashOrCustom', filters.flashType);
          if (filters.size) params.append('size', filters.size);
          if (filters.styles.length > 0) params.append('styles', filters.styles.join(','));
          if (filters.subjects.length > 0) params.append('subjects', filters.subjects.join(','));
        } else {
          filters.priceRange.forEach(price => params.append('priceRange', price));
          if (filters.inkSpecialty) params.append('inkSpecialty', filters.inkSpecialty);
          if (filters.designSpecialty) params.append('designSpecialty', filters.designSpecialty);
          if (filters.styleSpecialties.length > 0) params.append('styleSpecialties', filters.styleSpecialties.join(','));
          if (filters.subjectSpecialties.length > 0) params.append('subjectSpecialties', filters.subjectSpecialties.join(','));
        }

        const endpoint = searchType === 'artists' ? '/api/search/artists' : '/api/search/posts';
        const response = await fetch(`http://localhost:5000${endpoint}?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch search results');
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [submittedQuery, filters, searchType, sortOption]);

  // Generic togglers
  const toggleSingleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? '' : value }));
  };

  const toggleArrayFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }));
  };

  const handleSortToggle = () => setSortOption(prev => prev === 'newest' ? 'likes' : 'newest');

  const handleSearchTypeToggle = (type) => {
    setSearchType(type);
    setSearchResults([]);
  };

  const handleSearchSubmit = () => setSubmittedQuery(searchQuery.trim());
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearchSubmit(); };
  const resetFilters = () => { setFilters(EMPTY_FILTERS); setSearchQuery(''); setSubmittedQuery(''); };

  const activeFilterCount = searchType === 'posts'
    ? [filters.colorType, filters.flashType, filters.size, ...filters.location, ...filters.priceRange, ...filters.styles, ...filters.subjects].filter(Boolean).length
    : [filters.inkSpecialty, filters.designSpecialty, ...filters.location, ...filters.priceRange, ...filters.styleSpecialties, ...filters.subjectSpecialties].filter(Boolean).length;

  // ---- Filter sub-components ----
  const EitherOrFilterRow = ({ label, options, filterKey }) => (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="flex gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => toggleSingleFilter(filterKey, opt)}
            className={`flex-1 py-1.5 text-sm rounded-full border font-medium transition-colors ${
              filters[filterKey] === opt
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  const ChipFilterGroup = ({ label, options, filterKey }) => (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => toggleArrayFilter(filterKey, opt)}
            className={`px-2.5 py-1 text-xs rounded-full border font-medium transition-colors ${
              filters[filterKey].includes(opt)
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  const renderSearchItem = (item, isGrid) => {
    const isPost = item.image !== undefined;

    if (isPost && isGrid) {
      return <PostItem key={item._id} post={item} onCommentClick={setSelectedPost} />;
    }

    if (!isPost && isGrid) {
      return (
        <div key={item._id} className="relative group">
          <Link to={profileUrl(item)} className="block">
            <div className="aspect-square relative overflow-hidden rounded-lg border border-gray-200">
              <div className="w-full h-full">
                <ProfileImage user={item} size="xl" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 flex flex-col justify-end">
                <h3 className="font-bold text-white text-lg">{item.username}</h3>
                {item.location && (
                  <div className="flex items-center text-white/90 text-sm">
                    <MapPin size={12} className="mr-1 flex-shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                )}
              </div>
              {/* Follower and like counts - bottom right */}
              <div className="absolute bottom-3 right-3 flex flex-col items-end gap-0.5">
                <div className="flex items-center text-white/90 text-xs drop-shadow">
                  <span className="mr-1">{formatNum(item.followersCount || 0)}</span>
                  <Users size={11} />
                </div>
                <div className="flex items-center text-white/90 text-xs drop-shadow">
                  <span className="mr-1">{formatNum(item.totalLikes || 0)}</span>
                  <Heart size={11} fill="currentColor" className="text-red-400" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      );
    }

    if (isPost) {
      return (
        <div key={item._id} className="bg-white border border-gray-200 rounded-md mb-6">
          <div className="flex items-center p-3">
            <Link to={profileUrl(item.user)} className="flex items-center">
              <ProfileImage user={item.user} size="md" />
              <div className="ml-3">
                <p className="font-semibold">{item.user.username}</p>
              </div>
            </Link>
          </div>
          <img src={`http://localhost:5000/${item.image}`} alt={item.caption} className="w-full object-cover" />
          <div className="p-3">
            <p><Link to={profileUrl(item.user)} className="font-semibold">{item.user.username}</Link> {item.caption}</p>
          </div>
        </div>
      );
    } else {
      return (
        <div key={item._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
          <div className="flex">
            <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
              <ProfileImage user={item} size="xl" className="w-full h-full object-cover" />
            </div>
            <div className="p-4 flex-grow">
              <Link to={profileUrl(item)} className="font-semibold text-lg hover:text-blue-600">{item.username}</Link>
              {item.location && (
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin size={14} className="mr-1" />
                  <span>{item.location}</span>
                </div>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Users size={13} />{formatNum(item.followersCount || 0)}</span>
                <span className="flex items-center gap-1"><Heart size={13} fill="currentColor" className="text-red-400" />{formatNum(item.totalLikes || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      {/* Title (left) + Posts / Artists toggle (centered) */}
      <div className="grid grid-cols-3 items-center mb-6">
        <h1 className="text-3xl font-bold">Search</h1>
        <div className="flex justify-center">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button type="button" onClick={() => handleSearchTypeToggle('posts')} className={`flex items-center px-4 py-2 text-sm font-medium rounded-l-lg ${searchType === 'posts' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'}`}>
              <Image size={16} className="mr-2" /> Posts
            </button>
            <button type="button" onClick={() => handleSearchTypeToggle('artists')} className={`flex items-center px-4 py-2 text-sm font-medium rounded-r-lg ${searchType === 'artists' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'}`}>
              <Users size={16} className="mr-2" /> Artists
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setViewMode('feed')} className={`p-2 rounded ${viewMode === 'feed' ? 'bg-white shadow' : ''}`}>
              <BarChart2 size={20} />
            </button>
            <button onClick={() => setViewMode('grid3')} className={`p-2 rounded mx-1 ${viewMode === 'grid3' ? 'bg-white shadow' : ''}`}>
              <LayoutGrid size={20} />
            </button>
            <button onClick={() => setViewMode('grid5')} className={`p-2 rounded ${viewMode === 'grid5' ? 'bg-white shadow' : ''}`}>
              <Grid size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex flex-col md:flex-row items-center mb-6">
        <div className="relative flex-grow mb-4 md:mb-0 md:mr-4 w-full">
          <input
            type="text"
            placeholder={searchType === 'artists' ? "Search artists by username..." : "Search posts by tags or username..."}
            className="w-full pl-10 pr-24 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <button onClick={handleSearchSubmit} className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600">
            Go
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center px-4 py-2 rounded-lg hover:bg-gray-200 transition ${activeFilterCount > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}>
            <Filter size={18} className="mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1.5 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
          <button onClick={handleSortToggle} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium whitespace-nowrap">
            {sortOption === 'newest' ? 'Sort - New' : (searchType === 'artists' ? 'Sort - Followers' : 'Sort - Likes')}
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-5 mb-6 border border-gray-200">
          <h3 className="font-semibold mb-4 text-center">Filter Options</h3>

          {searchType === 'posts' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              {/* Left column */}
              <div>
                <EitherOrFilterRow label="Ink" options={COLOR_TYPES} filterKey="colorType" />

                {/* Size */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Size</p>
                  <div className="flex gap-2">
                    {SIZES.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSingleFilter('size', s)}
                        className={`flex-1 py-1.5 text-sm rounded-full border font-medium transition-colors ${
                          filters.size === s
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location - 2-column grid */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</p>
                  <div className="grid grid-cols-2 gap-x-2">
                    {BAY_AREA_CITIES.map(city => (
                      <label key={city} className="flex items-center text-sm py-0.5 px-1 hover:bg-gray-100 rounded cursor-pointer">
                        <input type="checkbox" checked={filters.location.includes(city)} onChange={() => toggleArrayFilter('location', city)} className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600" />
                        {city}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div>
                <ChipFilterGroup label="Style" options={STYLES} filterKey="styles" />
                <ChipFilterGroup label="Subject" options={SUBJECTS} filterKey="subjects" />

                {/* Flash Sheet / Tattoo Work toggle */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Type</p>
                  <div className="flex rounded-full border border-gray-300 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleSingleFilter('flashType', 'Tattoo Work')}
                      className={`flex-1 py-1.5 text-sm font-medium transition-colors ${filters.flashType === 'Tattoo Work' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      Tattoo Work
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSingleFilter('flashType', 'Flash Sheet')}
                      className={`flex-1 py-1.5 text-sm font-medium transition-colors border-l border-gray-300 ${filters.flashType === 'Flash Sheet' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      Flash Sheet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Artists filter panel */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              {/* Left column */}
              <div>
                {/* Ink specialty */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Ink</p>
                  <div className="flex gap-2">
                    {[{ label: 'Black/Grey', value: 'Black/Grey Specialty' }, { label: 'Color', value: 'Color Specialty' }].map(({ label, value }) => (
                      <button key={value} type="button" onClick={() => toggleSingleFilter('inkSpecialty', value)}
                        className={`flex-1 py-1.5 text-sm rounded-full border font-medium transition-colors ${filters.inkSpecialty === value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Design specialty */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Design</p>
                  <div className="flex gap-2">
                    {[{ label: 'Flash', value: 'Flash Specialty' }, { label: 'Custom', value: 'Custom Specialty' }].map(({ label, value }) => (
                      <button key={value} type="button" onClick={() => toggleSingleFilter('designSpecialty', value)}
                        className={`flex-1 py-1.5 text-sm rounded-full border font-medium transition-colors ${filters.designSpecialty === value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Price</p>
                  <div className="flex gap-2">
                    {['$', '$$', '$$$', '$$$$'].map(price => (
                      <button key={price} type="button" onClick={() => toggleArrayFilter('priceRange', price)}
                        className={`flex-1 py-1.5 text-sm rounded-full border font-medium transition-colors ${filters.priceRange.includes(price) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'}`}>
                        {price}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</p>
                  <div className="grid grid-cols-2 gap-x-2">
                    {BAY_AREA_CITIES.map(city => (
                      <label key={city} className="flex items-center text-sm py-0.5 px-1 hover:bg-gray-100 rounded cursor-pointer">
                        <input type="checkbox" checked={filters.location.includes(city)} onChange={() => toggleArrayFilter('location', city)} className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600" />
                        {city}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column — specialty chips */}
              <div>
                <ChipFilterGroup label="Style" options={STYLES} filterKey="styleSpecialties" />
                <ChipFilterGroup label="Subject" options={SUBJECTS} filterKey="subjectSpecialties" />
              </div>
            </div>
          )}

          <div className="flex justify-end mt-4 space-x-2 border-t pt-3">
            <button className="px-4 py-2 text-sm rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400" onClick={resetFilters}>Reset</button>
            <button className="px-4 py-2 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600" onClick={() => setShowFilters(false)}>Apply</button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-xl font-semibold">{searchType === 'artists' ? 'Tattoo Artists' : 'Tattoo Designs'}</h2>
      </div>

      {loading && <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" /></div>}
      {!loading && searchResults.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500">No results found</p>
          <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
        </div>
      )}
      {!loading && searchResults.length > 0 && (
        viewMode === 'feed'
          ? <div className="max-w-xl mx-auto">{searchResults.map(result => renderSearchItem(result, false))}</div>
          : <div className={`grid ${viewMode === 'grid3' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'} gap-4`}>{searchResults.map(result => renderSearchItem(result, true))}</div>
      )}

      {selectedPost && (
        <CommentModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
};

export default SearchPage;
