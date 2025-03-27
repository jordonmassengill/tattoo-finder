import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, DollarSign, Filter, View, Grid3x3, Grid } from 'lucide-react';

// Mock data for search results
const mockSearchResults = [
  {
    id: 1,
    image: '/api/placeholder/600/600',
    artistId: 101,
    artistName: 'InkMaster',
    shopName: 'InkCraft Studio',
    location: 'Brooklyn, NY',
    priceRange: '$$-$$$',
    styles: ['Geometric', 'Blackwork', 'Minimalist'],
    likes: 245,
    caption: 'Custom sleeve design with geometric elements.'
  },
  {
    id: 2,
    image: '/api/placeholder/600/600',
    artistId: 102,
    artistName: 'ColorQueen',
    shopName: 'Vivid Ink Gallery',
    location: 'Los Angeles, CA',
    priceRange: '$$$',
    styles: ['Watercolor', 'Illustrative', 'Floral'],
    likes: 189,
    caption: 'Watercolor butterfly piece I did yesterday.'
  },
  {
    id: 3,
    image: '/api/placeholder/600/600',
    artistId: 103,
    artistName: 'Traditional_Joe',
    shopName: 'Old School Tattoo',
    location: 'Chicago, IL',
    priceRange: '$$',
    styles: ['Traditional', 'American', 'Sailor'],
    likes: 320,
    caption: 'Classic sailor design with a modern twist.'
  },
  {
    id: 4,
    image: '/api/placeholder/600/600',
    artistId: 104,
    artistName: 'LineArtist',
    shopName: 'Minimalist Ink',
    location: 'Seattle, WA',
    priceRange: '$$',
    styles: ['Linework', 'Minimalist', 'Fineline'],
    likes: 178,
    caption: 'Minimalist line work on forearm.'
  },
  {
    id: 5,
    image: '/api/placeholder/600/600',
    artistId: 105,
    artistName: 'BlackworkSpecialist',
    shopName: 'Dark Matter Tattoo',
    location: 'Portland, OR',
    priceRange: '$$$',
    styles: ['Blackwork', 'Mandala', 'Dotwork'],
    likes: 412,
    caption: 'Detailed mandala back piece, 8-hour session.'
  },
  {
    id: 6,
    image: '/api/placeholder/600/600',
    artistId: 106,
    artistName: 'NeoTradQueen',
    shopName: 'Modern Classic Tattoo',
    location: 'Denver, CO',
    priceRange: '$$$',
    styles: ['Neo-Traditional', 'Illustrative', 'Color'],
    likes: 267,
    caption: 'Neo-traditional fox with floral elements.'
  },
  {
    id: 7,
    image: '/api/placeholder/600/600',
    artistId: 107,
    artistName: 'JapaneseInkMaster',
    shopName: 'Rising Sun Tattoo',
    location: 'San Francisco, CA',
    priceRange: '$$$$',
    styles: ['Japanese', 'Irezumi', 'Traditional'],
    likes: 380,
    caption: 'Traditional Japanese koi sleeve.'
  },
  {
    id: 8,
    image: '/api/placeholder/600/600',
    artistId: 108,
    artistName: 'RealismPro',
    shopName: 'Hyperreal Ink',
    location: 'Miami, FL',
    priceRange: '$$$$',
    styles: ['Realism', 'Portrait', 'Black and Grey'],
    likes: 456,
    caption: 'Hyperrealistic portrait, 12 hour session.'
  },
  {
    id: 9,
    image: '/api/placeholder/600/600',
    artistId: 109,
    artistName: 'SciFiInker',
    shopName: 'Future Ink',
    location: 'Austin, TX',
    priceRange: '$$$',
    styles: ['Sci-Fi', 'Cyberpunk', 'Illustrative'],
    likes: 201,
    caption: 'Cyberpunk themed sleeve design.'
  }
];

// Available tattoo styles for filtering
const tattooStyles = [
  'Geometric', 'Blackwork', 'Minimalist', 'Watercolor', 'Illustrative', 
  'Traditional', 'Neo-Traditional', 'Japanese', 'Irezumi', 'Realism', 
  'Portrait', 'Tribal', 'Dotwork', 'Linework', 'Mandala', 'Sci-Fi',
  'Abstract', 'Floral', 'American Traditional', 'Black and Grey'
];

// Component for a single search result in grid view
const SearchResultGrid = ({ result, viewMode }) => (
  <div className="relative group cursor-pointer">
    <Link to={`/artist/${result.artistId}`}>
      <img 
        src={result.image} 
        alt={result.caption} 
        className="w-full aspect-square object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2">
        <p className="font-bold text-center mb-1">{result.artistName}</p>
        <p className="text-sm text-center mb-1">{result.shopName}</p>
        <div className="flex items-center mb-1">
          <MapPin size={12} className="mr-1" />
          <span className="text-xs">{result.location}</span>
        </div>
        <div className="flex items-center mb-2">
          <DollarSign size={12} className="mr-1" />
          <span className="text-xs">{result.priceRange}</span>
        </div>
        <div className="flex items-center">
          <span className="mr-2">❤️</span> {result.likes}
        </div>
      </div>
    </Link>
  </div>
);

// Component for a single search result in feed view
const SearchResultFeed = ({ result }) => (
  <div className="bg-white border border-gray-200 rounded-md mb-6">
    {/* Result Header */}
    <div className="flex items-center p-3">
      <Link to={`/artist/${result.artistId}`} className="flex items-center">
        <div className="ml-3">
          <p className="font-semibold">{result.artistName}</p>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin size={12} className="mr-1" />
            <span>{result.location}</span>
            <span className="mx-1">•</span>
            <DollarSign size={12} className="mr-1" />
            <span>{result.priceRange}</span>
          </div>
        </div>
      </Link>
    </div>
    
    {/* Result Image */}
    <Link to={`/artist/${result.artistId}`}>
      <img 
        src={result.image} 
        alt={result.caption} 
        className="w-full object-cover"
      />
    </Link>
    
    {/* Result Actions */}
    <div className="p-3">
      <div className="flex items-center mb-3">
        <button className="mr-4">❤️</button>
        <button className="mr-4">💬</button>
        <button>🔖</button>
      </div>
      <p className="font-semibold mb-1">{result.likes} likes</p>
      <p>
        <Link to={`/artist/${result.artistId}`} className="font-semibold">{result.artistName}</Link> {result.caption}
      </p>
      <p className="text-gray-500 text-sm mt-1">View all comments</p>
      <div className="mt-2">
        <span className="text-sm text-gray-500">Styles: </span>
        {result.styles.map((style, index) => (
          <span key={index} className="text-sm text-blue-500 mr-2">#{style.toLowerCase()}</span>
        ))}
      </div>
    </div>
  </div>
);

const SearchPage = () => {
  const [viewMode, setViewMode] = useState('grid3');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    priceRange: [],
    styles: [],
    distance: 50,
  });
  
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
  
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row items-center mb-6">
        <div className="relative flex-grow mb-4 md:mb-0 md:mr-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search tattoo artists, styles, locations..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
        >
          <Filter size={18} className="mr-2" />
          Filters
        </button>
        
        <div className="flex ml-0 md:ml-4 mt-4 md:mt-0">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('feed')}
              className={`p-2 rounded ${viewMode === 'feed' ? 'bg-white shadow' : ''}`}
            >
              <View size={20} />
            </button>
            <button 
              onClick={() => setViewMode('grid3')}
              className={`p-2 rounded mx-1 ${viewMode === 'grid3' ? 'bg-white shadow' : ''}`}
            >
              <Grid3x3 size={20} />
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
              onClick={() => setFilters({
                location: '',
                priceRange: [],
                styles: [],
                distance: 50,
              })}
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
      
      {/* Search Results */}
      {viewMode === 'feed' ? (
        <div className="max-w-xl mx-auto">
          {mockSearchResults.map(result => (
            <SearchResultFeed key={result.id} result={result} />
          ))}
        </div>
      ) : (
        <div className={`grid ${viewMode === 'grid3' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'} gap-4`}>
          {mockSearchResults.map(result => (
            <SearchResultGrid key={result.id} result={result} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;