import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Filter, Users, Image, Heart, MessageCircle, Search, Bookmark } from 'lucide-react';
import ProfileImage from './ProfileImage';
import { BAY_AREA_CITIES } from '../constants/locations';
import CommentModal from './CommentModal';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

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
    if (!currentUser) {
      alert("Please log in to like posts.");
      return;
    }

    const originalIsLiked = isLiked;
    setIsLiked(!originalIsLiked);
    setLikeCount(prevCount => originalIsLiked ? prevCount - 1 : prevCount + 1);

    try {
      const apiCall = originalIsLiked ? api.unlikePost : api.likePost;
      await apiCall(post._id);
    } catch (error) {
      console.error('Error toggling like:', error);
      setIsLiked(originalIsLiked);
      setLikeCount(prevCount => originalIsLiked ? prevCount + 1 : prevCount - 1);
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
    } catch (error) {
      console.error('Error toggling save:', error);
      setIsSaved(originalSavedState);
      alert("Failed to update saved status. Please try again.");
    }
  };

  return (
    <div key={post._id} className="relative group cursor-pointer" onClick={() => onCommentClick(post)}>
      <img src={`http://localhost:5000/${post.image}`} alt={post.caption} className="w-full aspect-portrait object-cover rounded-lg" />
      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white p-2 rounded-lg">
        <div className="flex items-center text-lg font-bold">
          <button onClick={handleLikeToggle} className="flex items-center mr-5">
            <Heart 
              size={22} 
              className={`mr-1.5 transition-colors ${isLiked ? 'text-red-500' : 'text-white'}`}
              fill={isLiked ? 'currentColor' : 'none'}
            />
            <span>{likeCount}</span>
          </button>
          <div className="flex items-center" onClick={() => onCommentClick(post)}>
            <MessageCircle size={22} fill="currentColor" className="mr-1.5 text-white" />
            <span>{post.comments.length}</span>
          </div>
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

        <Link to={`/artist/${post.user.username}`} onClick={(e) => e.stopPropagation()} className="absolute bottom-2 left-2 text-sm font-medium hover:underline bg-black/50 px-2 py-1 rounded">
          by {post.user.username}
        </Link>
      </div>
    </div>
  );
};


const SearchPage = () => {
  const [viewMode, setViewMode] = useState('grid3');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [searchType, setSearchType] = useState('posts');
  const [filters, setFilters] = useState({
    location: [],
    priceRange: [],
    styles: [],
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [sortOption, setSortOption] = useState('newest');

  const tattooStyles = [
    'Geometric', 'Blackwork', 'Minimalist', 'Watercolor', 'Illustrative',
    'Traditional', 'Neo-Traditional', 'Japanese', 'Irezumi', 'Realism',
    'Portrait', 'Tribal', 'Dotwork', 'Linework', 'Mandala', 'Sci-Fi',
    'Abstract', 'Floral', 'American Traditional', 'Black and Grey'
  ];

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (submittedQuery) {
          params.append('query', submittedQuery);
        }
        if (filters.location.length > 0) {
          filters.location.forEach(loc => params.append('location', loc));
        }
        if (filters.priceRange.length > 0) {
          filters.priceRange.forEach(price => params.append('priceRange', price));
        }
        if (filters.styles.length > 0) {
          params.append('styles', filters.styles.join(','));
        }
        params.append('sort', sortOption);

        const endpoint = searchType === 'artists' ? '/api/search/artists' : '/api/search/posts';

        const response = await fetch(`http://localhost:5000${endpoint}?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }
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

  const togglePriceFilter = (price) => {
    setFilters(prev => ({
      ...prev,
      priceRange: prev.priceRange.includes(price)
        ? prev.priceRange.filter(p => p !== price)
        : [...prev.priceRange, price]
    }));
  };

  const toggleLocationFilter = (city) => {
    setFilters(prev => ({
      ...prev,
      location: prev.location.includes(city)
        ? prev.location.filter(loc => loc !== city)
        : [...prev.location, city]
    }));
  };

  const toggleStyleFilter = (style) => {
    setFilters(prev => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter(s => s !== style)
        : [...prev.styles, style]
    }));
  };
  
  const handleSortToggle = () => {
    setSortOption(prevOption => (prevOption === 'newest' ? 'likes' : 'newest'));
  };

  const handleSearchTypeToggle = (type) => {
    setSearchType(type);
    setSearchResults([]);
  };

  const handleSearchSubmit = () => {
    setSubmittedQuery(searchQuery.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const resetFilters = () => {
    setFilters({ location: [], priceRange: [], styles: [] });
    setSearchQuery('');
    setSubmittedQuery('');
  };

  const renderSearchItem = (item, isGrid) => {
    const isPost = item.image !== undefined;

    if (isPost && isGrid) {
      return <PostItem key={item._id} post={item} onCommentClick={setSelectedPost} />;
    }
    
    if (!isPost && isGrid) {
      return (
        <div key={item._id} className="relative group">
          <Link to={`/artist/${item.username}`} className="block">
            <div className="aspect-square relative overflow-hidden rounded-lg border border-gray-200">
              <div className="w-full h-full">
                <ProfileImage user={item} size="xl" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-3">
                <h3 className="font-bold text-white text-lg">{item.username}</h3>
                {item.location && (
                  <div className="flex items-center text-white/90 text-sm">
                    <MapPin size={12} className="mr-1 flex-shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                )}
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
            <Link to={`/artist/${item.user.username}`} className="flex items-center">
              <ProfileImage user={item.user} size="md" />
              <div className="ml-3">
                <p className="font-semibold">{item.user.username}</p>
              </div>
            </Link>
          </div>
          <img src={`http://localhost:5000/${item.image}`} alt={item.caption} className="w-full object-cover" />
          <div className="p-3">
            <p><Link to={`/artist/${item.user.username}`} className="font-semibold">{item.user.username}</Link> {item.caption}</p>
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
              <Link to={`/artist/${item.username}`} className="font-semibold text-lg hover:text-blue-600">{item.username}</Link>
              {item.location && (
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin size={14} className="mr-1" />
                  <span>{item.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button type="button" onClick={() => handleSearchTypeToggle('posts')} className={`flex items-center px-4 py-2 text-sm font-medium rounded-l-lg ${searchType === 'posts' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'}`}>
            <Image size={16} className="mr-2" /> Posts
          </button>
          <button type="button" onClick={() => handleSearchTypeToggle('artists')} className={`flex items-center px-4 py-2 text-sm font-medium rounded-r-lg ${searchType === 'artists' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'}`}>
            <Users size={16} className="mr-2" /> Artists
          </button>
        </div>
      </div>

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
            onClick={handleSortToggle} 
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium whitespace-nowrap"
          >
            {sortOption === 'newest' ? 'Sort - New' : 'Sort - Likes'}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-4 text-center">Filter Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-5">
                <label className="block mb-2 font-medium">Tattoo Style</label>
                <div className="pr-2 max-h-48 overflow-y-auto border rounded p-2 bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {tattooStyles.map((style) => (
                      <label key={style} className="flex items-center text-sm py-1 px-1 hover:bg-gray-100 rounded">
                        <input type="checkbox" checked={filters.styles.includes(style)} onChange={() => toggleStyleFilter(style)} className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        {style}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {searchType === 'artists' && (
                <div>
                  <label className="block mb-2 font-medium">Price Range</label>
                  <div className="flex justify-start flex-wrap gap-2 mt-1">
                    {['$', '$$', '$$$', '$$$$'].map((price) => (
                      <button key={price} type="button" onClick={() => togglePriceFilter(price)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filters.priceRange.includes(price) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                        {price}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <label className="block mb-2 font-medium">Location</label>
                <div className="pr-2 max-h-48 overflow-y-auto border rounded p-2 bg-white">
                  {BAY_AREA_CITIES.map((city) => (
                    <label key={city} className="flex items-center text-sm py-1 px-1 hover:bg-gray-100 rounded">
                      <input type="checkbox" checked={filters.location.includes(city)} onChange={() => toggleLocationFilter(city)} className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      {city}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-end justify-end mt-4 space-x-2">
                <button className="px-4 py-2 text-sm rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400" onClick={resetFilters}>Reset</button>
                <button className="px-4 py-2 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600" onClick={() => setShowFilters(false)}>Apply</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-xl font-semibold">{searchType === 'artists' ? 'Tattoo Artists' : 'Tattoo Designs'}</h2>
      </div>

      {loading && (<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>)}
      {!loading && searchResults.length === 0 && (<div className="text-center py-20"><p className="text-xl text-gray-500">No results found</p><p className="text-gray-400 mt-2">Try adjusting your search or filters</p></div>)}
      {!loading && searchResults.length > 0 && (
        viewMode === 'feed'
          ? <div className="max-w-xl mx-auto">{searchResults.map(result => renderSearchItem(result, false))}</div>
          : <div className={`grid ${viewMode === 'grid3' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'} gap-4`}>{searchResults.map(result => renderSearchItem(result, true))}</div>
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

export default SearchPage;