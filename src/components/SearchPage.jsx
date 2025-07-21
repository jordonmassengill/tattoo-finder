import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Filter, BarChart2, LayoutGrid, Grid, Users, Image } from 'lucide-react';
import ProfileImage from './ProfileImage';
import { BAY_AREA_CITIES } from '../constants/locations'; // Import our cities list

const SearchPage = () => {
  const [viewMode, setViewMode] = useState('grid3');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('posts');
  const [filters, setFilters] = useState({
    location: [], // Changed from string to array
    priceRange: [],
    styles: [],
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Available tattoo styles for filtering
  const tattooStyles = [
    'Geometric', 'Blackwork', 'Minimalist', 'Watercolor', 'Illustrative',
    'Traditional', 'Neo-Traditional', 'Japanese', 'Irezumi', 'Realism',
    'Portrait', 'Tribal', 'Dotwork', 'Linework', 'Mandala', 'Sci-Fi',
    'Abstract', 'Floral', 'American Traditional', 'Black and Grey'
  ];

  // Fetch search results based on filters and search type
  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (searchQuery) {
          params.append('query', searchQuery);
        }

        // Handle multiple locations
        if (filters.location.length > 0) {
          filters.location.forEach(loc => params.append('location', loc));
        }

        if (filters.priceRange.length > 0) {
          filters.priceRange.forEach(price => params.append('priceRange', price));
        }

        if (filters.styles.length > 0) {
          const stylesParam = filters.styles.join(',');
          params.append('styles', stylesParam);
        }

        let endpoint;
        if (searchType === 'artists') {
          endpoint = '/api/search/artists';
        } else {
          endpoint = filters.styles.length > 0
            ? '/api/search/posts-by-style'
            : '/api/search/featured';
        }

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
  }, [searchQuery, filters, searchType]);

  // Toggle price range filter
  const togglePriceFilter = (price) => {
    setFilters(prev => {
      const updatedPrices = prev.priceRange.includes(price)
        ? prev.priceRange.filter(p => p !== price)
        : [...prev.priceRange, price];
      return { ...prev, priceRange: updatedPrices };
    });
  };

  // NEW: Toggle location filter
  const toggleLocationFilter = (city) => {
    setFilters(prev => {
      const updatedLocations = prev.location.includes(city)
        ? prev.location.filter(loc => loc !== city)
        : [...prev.location, city];
      return { ...prev, location: updatedLocations };
    });
  };

  // Toggle style filter
  const toggleStyleFilter = (style) => {
    setFilters(prev => {
      const updatedStyles = prev.styles.includes(style)
        ? prev.styles.filter(s => s !== style)
        : [...prev.styles, style];
      return { ...prev, styles: updatedStyles };
    });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchTypeToggle = (type) => {
    setSearchType(type);
    setSearchResults([]);
  };

  // Updated reset filters function
  const resetFilters = () => {
    setFilters({
      location: [],
      priceRange: [],
      styles: [],
    });
    setSearchQuery('');
  };

  // Render grid and feed items
  const renderSearchItem = (item, isGrid) => {
    const isPost = item.image !== undefined;

    if (!isPost && isGrid) {
      return (
        <div key={item._id} className="relative group">
          <Link to={`/artist/${item.username}`} className="block">
            <div className="aspect-square relative overflow-hidden rounded-lg border border-gray-200">
              <div className="w-full h-full">
                <ProfileImage
                  user={item}
                  size="xl"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-3 opacity-100 transition-opacity">
                <h3 className="font-bold text-white text-lg">{item.username}</h3>
                {item.location && (
                  <div className="flex items-center text-white/90 text-sm">
                    <MapPin size={12} className="mr-1 flex-shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                )}
                {item.styles && item.styles.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.styles.slice(0, 2).map(style => (
                      <span key={style} className="px-2 py-0.5 bg-black/30 backdrop-blur-sm text-white rounded-full text-xs">
                        {style}
                      </span>
                    ))}
                    {item.styles.length > 2 && (
                      <span className="px-2 py-0.5 bg-black/30 backdrop-blur-sm text-white rounded-full text-xs">
                        +{item.styles.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>
      );
    }

    if (isPost && isGrid) {
      return (
        <div key={item._id} className="relative group cursor-pointer">
          <Link to={`/artist/${item.user.username}`}>
            <img
              src={`http://localhost:5000/${item.image}`}
              alt={item.caption}
              className="w-full aspect-square object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 rounded-lg">
              <p className="font-bold text-center mb-1">
                {item.user.username}
              </p>
              {item.user.location && (
                <div className="flex items-center mb-1">
                  <MapPin size={12} className="mr-1" />
                  <span className="text-xs">{item.user.location}</span>
                </div>
              )}
              <div className="flex items-center">
                <span className="mr-2">❤️</span> {item.likes.length}
              </div>
              {item.styles && item.styles.length > 0 && (
                <div className="mt-2 text-xs">
                  <span className="font-semibold">Styles: </span>
                  {item.styles.join(', ')}
                </div>
              )}
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
                {item.user.location && (
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin size={12} className="mr-1" />
                    <span>{item.user.location}</span>
                  </div>
                )}
              </div>
            </Link>
          </div>
          <Link to={`/artist/${item.user.username}`}>
            <img
              src={`http://localhost:5000/${item.image}`}
              alt={item.caption}
              className="w-full object-cover"
            />
          </Link>
          <div className="p-3">
            <div className="flex items-center mb-3">
              <button className="mr-4">❤️</button>
              <button className="mr-4">💬</button>
              <button>🔖</button>
            </div>
            <p className="font-semibold mb-1">{item.likes.length} likes</p>
            <p>
              <Link to={`/artist/${item.user.username}`} className="font-semibold">{item.user.username}</Link> {item.caption}
            </p>
            <p className="text-gray-500 text-sm mt-1">View all {item.comments.length} comments</p>
            {item.styles && item.styles.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.styles.map(style => (
                  <span key={style} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                    {style}
                  </span>
                ))}
              </div>
            )}
            <p className="text-gray-400 text-xs mt-2">
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div key={item._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
          <div className="flex">
            <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
              <ProfileImage
                user={item}
                size="xl"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 flex-grow">
              <Link to={`/artist/${item.username}`} className="font-semibold text-lg hover:text-blue-600">
                {item.username}
              </Link>
              {item.location && (
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin size={14} className="mr-1" />
                  <span>{item.location}</span>
                </div>
              )}
              {item.styles && item.styles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Styles:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.styles.map(style => (
                      <span key={style} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between mt-3">
                <div className="text-sm">
                  <span className="font-medium">{item.postCount || 0}</span> posts
                </div>
                <div className="text-sm">
                  <span className="font-medium">{item.followersCount || 0}</span> followers
                </div>
                <Link to={`/artist/${item.username}`} className="text-blue-500 text-sm font-medium">
                  View Profile
                </Link>
              </div>
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
          <button
            type="button"
            onClick={() => handleSearchTypeToggle('posts')}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-l-lg ${searchType === 'posts' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
          >
            <Image size={16} className="mr-2" />
            Posts
          </button>
          <button
            type="button"
            onClick={() => handleSearchTypeToggle('artists')}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-r-lg ${searchType === 'artists' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
          >
            <Users size={16} className="mr-2" />
            Artists
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center mb-6 pr-13">
        <div className="relative flex-grow mb-4 md:mb-0 md:mr-4 w-full md:w-auto">
          <input
            type="text"
            placeholder={searchType === 'artists' ? "Search for tattoo artists..." : "Search for tattoo styles, designs..."}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
        >
          <Filter size={18} className="mr-2" />
          Filters
        </button>

        <div className="flex ml-0 md:ml-4 mt-4 md:mt-0">
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
      </div>

      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-4">Filter Options</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-5">
                <label className="block mb-2 font-medium">Location</label>
                <div className="pr-2 max-h-48 overflow-y-auto border rounded p-2 bg-white">
                  {BAY_AREA_CITIES.map((city) => (
                    <label key={city} className="flex items-center text-sm py-1 px-1 hover:bg-gray-100 rounded">
                      <input
                        type="checkbox"
                        checked={filters.location.includes(city)}
                        onChange={() => toggleLocationFilter(city)}
                        className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {city}
                    </label>
                  ))}
                </div>
              </div>

              {searchType === 'artists' && (
                <div className="mb-5">
                  <label className="block mb-2 font-medium">Price Range</label>
                  <div className="flex justify-center flex-wrap gap-2 mt-1">
                    {['$', '$$', '$$$', '$$$$'].map((price) => (
                      <button
                        key={price}
                        onClick={() => togglePriceFilter(price)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filters.priceRange.includes(price)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                      >
                        {price}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block mb-2 font-medium">Tattoo Style</label>
              <div className="pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
                  {tattooStyles.map((style) => (
                    <label key={style} className="flex items-center text-sm py-0.5 px-1 hover:bg-gray-100 rounded">
                      <input
                        type="checkbox"
                        checked={filters.styles.includes(style)}
                        onChange={() => toggleStyleFilter(style)}
                        className="mr-2"
                      />
                      {style}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
              onClick={() => setShowFilters(false)}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-xl font-semibold">
          {searchType === 'artists' ? 'Tattoo Artists' : 'Tattoo Designs'}
          {filters.styles.length > 0 && ` - ${filters.styles.join(', ')}`}
          {filters.location.length > 0 && ` in ${filters.location.join(', ')}`}
        </h2>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!loading && searchResults.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500">No results found</p>
          <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
        </div>
      )}

      {!loading && searchResults.length > 0 && (
        viewMode === 'feed' ? (
          <div className="max-w-xl mx-auto">
            {searchResults.map(result => renderSearchItem(result, false))}
          </div>
        ) : (
          <div className={`grid ${viewMode === 'grid3' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'} gap-4`}>
            {searchResults.map(result => renderSearchItem(result, true))}
          </div>
        )
      )}
    </div>
  );
};

export default SearchPage;