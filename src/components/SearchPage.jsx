import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Filter, BarChart2, LayoutGrid, Grid } from 'lucide-react';
import ProfileImage from './ProfileImage';

const SearchPage = () => {
  const [viewMode, setViewMode] = useState('grid3');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    priceRange: [],
    styles: [],
    distance: 50,
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
  
  // Fetch search results based on filters
  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams();
        
        if (searchQuery) {
          params.append('query', searchQuery);
        }
        
        if (filters.location) {
          params.append('location', filters.location);
        }
        
        if (filters.priceRange.length > 0) {
          filters.priceRange.forEach(price => params.append('priceRange', price));
        }
        
        if (filters.styles.length > 0) {
          params.append('styles', filters.styles.join(','));
        }
        
        // Fetch featured posts first (if no specific search)
        const endpoint = searchQuery ? '/api/search/artists' : '/api/search/featured';
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
    
    // Fetch initial results or when filters change
    fetchSearchResults();
  }, [searchQuery, filters]);
  
  // Toggle price range filter
  const togglePriceFilter = (price) => {
    setFilters(prev => {
      const updatedPrices = prev.priceRange.includes(price)
        ? prev.priceRange.filter(p => p !== price)
        : [...prev.priceRange, price];
      return { ...prev, priceRange: updatedPrices };
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
  
  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      location: '',
      priceRange: [],
      styles: [],
      distance: 50,
    });
    setSearchQuery('');
  };
  
  // Render grid and feed items
  const renderSearchItem = (item, isGrid) => {
    // Check if item is a post or artist
    const isPost = item.image !== undefined;
    
    if (isGrid) {
      return (
        <div key={item._id} className="relative group cursor-pointer">
          <Link to={isPost ? `/artist/${item.user.username}` : `/artist/${item.username}`}>
            {isPost ? (
              <img 
                src={`http://localhost:5000/${item.image}`} 
                alt={item.caption} 
                className="w-full aspect-square object-cover"
              />
            ) : (
              <ProfileImage 
                user={item} 
                size="xl" 
                className="w-full aspect-square"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2">
              <p className="font-bold text-center mb-1">
                {isPost ? item.user.username : item.username}
              </p>
              {item.location && (
                <div className="flex items-center mb-1">
                  <MapPin size={12} className="mr-1" />
                  <span className="text-xs">{item.location}</span>
                </div>
              )}
              {item.priceRange && (
                <div className="flex items-center mb-2">
                  <DollarSign size={12} className="mr-1" />
                  <span className="text-xs">{item.priceRange}</span>
                </div>
              )}
              {isPost && (
                <div className="flex items-center">
                  <span className="mr-2">❤️</span> {item.likes.length}
                </div>
              )}
            </div>
          </Link>
        </div>
      );
    }
    
    // Feed view
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
            <p className="text-gray-400 text-xs mt-2">
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      );
    } else {
      // Artist feed view
      return (
        <div key={item._id} className="bg-white border border-gray-200 rounded-md mb-6">
          <div className="flex items-center p-3">
            <Link to={`/artist/${item.username}`} className="flex items-center">
              <ProfileImage user={item} size="lg" />
              <div className="ml-3">
                <p className="font-semibold text-lg">{item.username}</p>
                {item.username && <p className="text-gray-500">@{item.username}</p>}
                {item.location && (
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin size={12} className="mr-1" />
                    <span>{item.location}</span>
                  </div>
                )}
              </div>
            </Link>
          </div>
          
          <div className="p-3 border-t">
            {item.styles && item.styles.length > 0 && (
              <div className="mb-2">
                <p className="text-sm text-gray-500 mb-1">Styles:</p>
                <div className="flex flex-wrap gap-1">
                  {item.styles.map(style => (
                    <span key={style} className="px-2 py-1 bg-gray-100 rounded-full text-xs">{style}</span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-between mt-2">
              <div className="text-sm">
                <span className="font-semibold">{item.postCount || 0}</span> posts
              </div>
              <div className="text-sm">
                <span className="font-semibold">{item.followersCount || 0}</span> followers
              </div>
              <Link to={`/artist/${item.username}`} className="text-blue-500 text-sm">View Profile</Link>
            </div>
          </div>
        </div>
      );
    }
  };
  
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row items-center mb-6 pr-13">
        <div className="relative flex-grow mb-4 md:mb-0 md:mr-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search tattoo artists, styles, locations..."
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
          <div className="flex bg-gray-100 rounded-lg p-1" style={{ marginRight: '80px' }}>
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
      
      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-4">Filter Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Location Filter */}
            <div>
              <label className="block mb-2 font-medium">Location</label>
              <input
                type="text"
                placeholder="City, State, or Zip"
                className="w-full p-2 border rounded"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
              />
              
              <div className="mt-3">
                <label className="block mb-2 font-medium">Distance</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={filters.distance}
                    onChange={(e) => setFilters({...filters, distance: parseInt(e.target.value)})}
                    className="w-full mr-2"
                  />
                  <span>{filters.distance} miles</span>
                </div>
              </div>
            </div>
            
            {/* Price Range Filter */}
            <div>
              <label className="block mb-2 font-medium">Price Range</label>
              <div className="space-y-2">
                {['$', '$$', '$$$', '$$$$'].map((price) => (
                  <label key={price} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.priceRange.includes(price)}
                      onChange={() => togglePriceFilter(price)}
                      className="mr-2"
                    />
                    {price}
                  </label>
                ))}
              </div>
            </div>
            
            {/* Tattoo Style Filter */}
            <div>
              <label className="block mb-2 font-medium">Tattoo Style</label>
              <div className="h-40 overflow-y-auto pr-2 space-y-1">
                {tattooStyles.map((style) => (
                  <label key={style} className="flex items-center">
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
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && searchResults.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500">No results found</p>
          <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
        </div>
      )}
      
      {/* Search Results */}
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