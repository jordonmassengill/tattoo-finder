import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, LayoutGrid, Grid, BarChart2, MapPin, DollarSign, Tag } from 'lucide-react';

// Mock data for demonstration
const mockArtistData = {
  id: 101,
  name: 'Jane "InkMaster" Smith',
  username: 'inkmaster',
  profilePic: '/api/placeholder/150/150',
  bio: 'Specializing in blackwork, geometric designs, and custom sleeves. 10+ years of experience. Based in Brooklyn, NYC.',
  location: 'Brooklyn, New York',
  shop: 'InkCraft Studio',
  shopId: 201,
  priceRange: '$$-$$$',
  styles: ['Geometric', 'Blackwork', 'Minimalist', 'Custom Sleeves'],
  followers: 12540,
  following: 325,
  postsCount: 218,
  posts: [
    {
      id: 1,
      image: '/api/placeholder/600/600',
      caption: 'Custom sleeve design with geometric elements.',
      likes: 245,
      comments: 18,
      timestamp: '2025-03-25T15:30:00'
    },
    // More posts...
    {
      id: 2,
      image: '/api/placeholder/600/600',
      caption: 'Dotwork mandala shoulder piece.',
      likes: 189,
      comments: 14,
      timestamp: '2025-03-23T10:15:00'
    },
    {
      id: 3,
      image: '/api/placeholder/600/600',
      caption: 'Geometric forearm design.',
      likes: 301,
      comments: 22,
      timestamp: '2025-03-21T14:30:00'
    },
    {
      id: 4,
      image: '/api/placeholder/600/600',
      caption: 'Blackwork abstract piece.',
      likes: 210,
      comments: 16,
      timestamp: '2025-03-19T11:45:00'
    },
    {
      id: 5,
      image: '/api/placeholder/600/600',
      caption: 'Minimalist line art tattoo.',
      likes: 276,
      comments: 19,
      timestamp: '2025-03-17T09:20:00'
    },
    {
      id: 6,
      image: '/api/placeholder/600/600',
      caption: 'Sacred geometry back piece (work in progress).',
      likes: 320,
      comments: 27,
      timestamp: '2025-03-15T16:10:00'
    },
    {
      id: 7,
      image: '/api/placeholder/600/600',
      caption: 'Fine line floral design.',
      likes: 195,
      comments: 13,
      timestamp: '2025-03-12T13:50:00'
    },
    {
      id: 8,
      image: '/api/placeholder/600/600',
      caption: 'Abstract geometric sleeve, session 3 of 5.',
      likes: 287,
      comments: 24,
      timestamp: '2025-03-10T12:30:00'
    },
    {
      id: 9,
      image: '/api/placeholder/600/600',
      caption: 'Dotwork skull design.',
      likes: 243,
      comments: 18,
      timestamp: '2025-03-08T10:15:00'
    }
  ]
};

const ArtistProfile = () => {
  const [viewMode, setViewMode] = useState('grid3');
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  
  return (
    <div className="max-w-screen-xl mx-auto pb-16">
      {/* Profile Header */}
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          {/* Profile Picture */}
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden flex-shrink-0 mb-4 md:mb-0 md:mr-8">
            <img 
              src={mockArtistData.profilePic} 
              alt={mockArtistData.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Profile Info */}
          <div className="flex-grow text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center mb-4">
              <h1 className="text-2xl font-bold mr-4">{mockArtistData.name}</h1>
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded-md font-medium mt-2 md:mt-0"
                onClick={() => setShowAppointmentModal(true)}
              >
                Book Appointment
              </button>
            </div>
            
            <div className="flex justify-center md:justify-start space-x-6 mb-4">
              <span><b>{mockArtistData.postsCount}</b> posts</span>
              <span><b>{mockArtistData.followers.toLocaleString()}</b> followers</span>
              <span><b>{mockArtistData.following.toLocaleString()}</b> following</span>
            </div>
            
            <div className="mb-2">
              <p>{mockArtistData.bio}</p>
            </div>
            
            <div className="flex flex-col space-y-1">
              <div className="flex items-center">
                <MapPin size={16} className="mr-2" />
                <span>{mockArtistData.location}</span>
              </div>
              <div className="flex items-center">
                <DollarSign size={16} className="mr-2" />
                <span>Price Range: {mockArtistData.priceRange}</span>
              </div>
              <div className="flex items-center">
                <Tag size={16} className="mr-2" />
                <span>Styles: {mockArtistData.styles.join(', ')}</span>
              </div>
              <div className="flex items-center">
                <Link to={`/shop/${mockArtistData.shopId}`} className="text-blue-500">
                  Working at: {mockArtistData.shop}
                </Link>
              </div>
            </div>
          </div>
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
      
      {/* Posts Grid */}
      <div className={`grid ${
        viewMode === 'feed' 
          ? 'grid-cols-1 max-w-xl mx-auto gap-6 p-4' 
          : viewMode === 'grid3' 
            ? 'grid-cols-3 gap-1' 
            : 'grid-cols-5 gap-1'
      }`}>
        {mockArtistData.posts.map(post => (
          <div key={post.id} className="relative group cursor-pointer">
            <img 
              src={post.image} 
              alt={post.caption} 
              className="w-full aspect-square object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <div className="flex items-center mr-4">
                <span className="mr-2">❤️</span> {post.likes}
              </div>
              <div className="flex items-center">
                <span className="mr-2">💬</span> {post.comments}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Appointment Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Book an Appointment</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowAppointmentModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="mb-2">Select a date and time to book with {mockArtistData.name}</p>
              <div className="border rounded p-4 text-center">
                <Calendar className="mx-auto mb-2" size={32} />
                <p>Calendar integration would go here</p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2"
                onClick={() => setShowAppointmentModal(false)}
              >
                Cancel
              </button>
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                onClick={() => {
                  alert('Appointment booking functionality would be implemented here');
                  setShowAppointmentModal(false);
                }}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistProfile;