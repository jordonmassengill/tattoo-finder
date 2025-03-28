import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, LayoutGrid, Grid, BarChart2 } from 'lucide-react';

// Mock data for demonstration
const mockShopData = {
  id: 201,
  name: 'InkCraft Studio',
  profilePic: '/api/placeholder/150/150',
  coverPhoto: '/api/placeholder/1200/400',
  bio: 'Premium tattoo studio in the heart of Brooklyn. Specializing in custom designs across various styles. Established 2015.',
  location: '123 Ink Street, Brooklyn, NY',
  phone: '(555) 123-4567',
  hours: 'Tue-Sat: 12PM-9PM, Sun-Mon: Closed',
  website: 'www.inkcraftstudio.com',
  followers: 8750,
  artistsCount: 5,
  artists: [
    {
      id: 101,
      name: 'Jane "InkMaster" Smith',
      profilePic: '/api/placeholder/100/100',
      specialty: 'Geometric, Blackwork',
    },
    {
      id: 110,
      name: 'Mike Shadows',
      profilePic: '/api/placeholder/100/100',
      specialty: 'Black & Grey, Realism',
    },
    {
      id: 111,
      name: 'Lisa Colors',
      profilePic: '/api/placeholder/100/100',
      specialty: 'Watercolor, Illustrative',
    },
    {
      id: 112,
      name: 'Tom Traditional',
      profilePic: '/api/placeholder/100/100',
      specialty: 'American Traditional, Old School',
    },
    {
      id: 113,
      name: 'Sam Linework',
      profilePic: '/api/placeholder/100/100',
      specialty: 'Minimalist, Fine Line',
    }
  ],
  // Combined gallery of all artists' work
  gallery: [
    { id: 1, image: '/api/placeholder/600/600', artistId: 101, likes: 245 },
    { id: 2, image: '/api/placeholder/600/600', artistId: 110, likes: 189 },
    { id: 3, image: '/api/placeholder/600/600', artistId: 111, likes: 301 },
    { id: 4, image: '/api/placeholder/600/600', artistId: 112, likes: 210 },
    { id: 5, image: '/api/placeholder/600/600', artistId: 113, likes: 276 },
    { id: 6, image: '/api/placeholder/600/600', artistId: 101, likes: 320 },
    { id: 7, image: '/api/placeholder/600/600', artistId: 110, likes: 195 },
    { id: 8, image: '/api/placeholder/600/600', artistId: 111, likes: 287 },
    { id: 9, image: '/api/placeholder/600/600', artistId: 112, likes: 243 },
    { id: 10, image: '/api/placeholder/600/600', artistId: 113, likes: 178 },
    { id: 11, image: '/api/placeholder/600/600', artistId: 101, likes: 222 },
    { id: 12, image: '/api/placeholder/600/600', artistId: 110, likes: 156 }
  ]
};

const ShopProfile = () => {
  const [viewMode, setViewMode] = useState('grid3');
  
  return (
    <div className="max-w-screen-xl mx-auto pb-16">
      {/* Cover Photo */}
      <div className="relative h-56 md:h-80 bg-gray-200">
        <img 
          src={mockShopData.coverPhoto} 
          alt={`${mockShopData.username} cover`} 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Profile Header */}
      <div className="p-4 border-b relative">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          {/* Profile Picture */}
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden flex-shrink-0 mb-4 md:mb-0 md:mr-8 border-4 border-white bg-white relative -mt-16 md:-mt-20">
            <img 
              src={mockShopData.profilePic} 
              alt={mockShopData.username} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Profile Info */}
          <div className="flex-grow text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <h1 className="text-2xl font-bold mr-4">{mockShopData.username}</h1>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md font-medium mt-2 md:mt-0">
                Follow
              </button>
            </div>
            
            <div className="flex justify-center md:justify-start space-x-6 mb-4">
              <span><b>{mockShopData.artistsCount}</b> artists</span>
              <span><b>{mockShopData.gallery.length}</b> tattoos</span>
              <span><b>{mockShopData.followers.toLocaleString()}</b> followers</span>
            </div>
            
            <div className="mb-2">
              <p>{mockShopData.bio}</p>
            </div>
            
            <div className="flex flex-col space-y-1">
              <div className="flex items-center">
                <MapPin size={16} className="mr-2" />
                <span>{mockShopData.location}</span>
              </div>
              <div className="flex items-center">
                <Phone size={16} className="mr-2" />
                <span>{mockShopData.phone}</span>
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-2" />
                <span>{mockShopData.hours}</span>
              </div>
              <div className="flex items-center">
                <a href={`https://${mockShopData.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                  {mockShopData.website}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Artists Section */}
<div className="p-4 border-b">
  <h2 className="text-xl font-bold mb-4">Our Artists</h2>
  <div className="flex overflow-x-auto space-x-4 pb-4">
    {mockShopData.artists.map(artist => (
      <Link to={`/artist/${artist.name}`} key={artist.id} className="flex-shrink-0">
        <div className="w-24 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden mb-2">
            <img 
              src={artist.profilePic} 
              alt={artist.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-sm font-medium text-center">{artist.name.split(' ')[0]}</p>
          <p className="text-xs text-gray-500 text-center">{artist.specialty}</p>
        </div>
      </Link>
    ))}
  </div>
</div>
      
      {/* View Mode Selector */}
      <div className="flex justify-end p-4 border-b">
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
      
      {/* Gallery Grid */}
      <div className={`grid ${
        viewMode === 'feed' 
          ? 'grid-cols-1 max-w-xl mx-auto gap-6 p-4' 
          : viewMode === 'grid3' 
            ? 'grid-cols-3 gap-1' 
            : 'grid-cols-5 gap-1'
      }`}>
        {mockShopData.gallery.map(item => (
          <div key={item.id} className="relative group cursor-pointer">
          <img 
            src={item.image} 
            alt="Tattoo artwork" 
            className="w-full aspect-square object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
            <div className="flex items-center">
              <span className="mr-2">❤️</span> {item.likes}
            </div>
            <Link to={`/artist/${mockShopData.artists.find(a => a.id === item.artistId)?.name || ''}`} className="absolute bottom-2 left-2 text-xs font-medium hover:underline">
              By: {mockShopData.artists.find(a => a.id === item.artistId)?.name.split(' ')[0]}
            </Link>
          </div>
        </div>
        ))}
      </div>
    </div>
  );
};

export default ShopProfile;