import React, { useState } from 'react';
import { BarChart2, LayoutGrid, Grid } from 'lucide-react';

// Mock data for demonstration
const mockPosts = [
  {
    id: 1,
    artistId: 101,
    artistName: 'InkMaster',
    artistProfilePic: '/api/placeholder/100/100',
    image: '/api/placeholder/600/600',
    caption: 'Custom sleeve design with geometric elements.',
    likes: 245,
    comments: 18,
    timestamp: '2025-03-25T15:30:00',
    tags: ['sleeve', 'geometric', 'blackwork']
  },
  // More mock posts...
  {
    id: 2,
    artistId: 102,
    artistName: 'ColorQueen',
    artistProfilePic: '/api/placeholder/100/100',
    image: '/api/placeholder/600/600',
    caption: 'Watercolor butterfly piece I did yesterday. So happy with how the colors turned out!',
    likes: 189,
    comments: 12,
    timestamp: '2025-03-24T12:15:00',
    tags: ['watercolor', 'butterfly', 'colorful']
  },
  {
    id: 3,
    artistId: 103,
    artistName: 'Traditional_Joe',
    artistProfilePic: '/api/placeholder/100/100',
    image: '/api/placeholder/600/600',
    caption: 'Classic sailor design with a modern twist.',
    likes: 320,
    comments: 24,
    timestamp: '2025-03-23T18:45:00',
    tags: ['traditional', 'sailor', 'oldschool']
  },
  {
    id: 4,
    artistId: 104,
    artistName: 'LineArtist',
    artistProfilePic: '/api/placeholder/100/100',
    image: '/api/placeholder/600/600',
    caption: 'Minimalist line work on forearm. Simple but elegant.',
    likes: 178,
    comments: 9,
    timestamp: '2025-03-23T10:30:00',
    tags: ['linework', 'minimalist', 'forearm']
  },
  {
    id: 5,
    artistId: 105,
    artistName: 'BlackworkSpecialist',
    artistProfilePic: '/api/placeholder/100/100',
    image: '/api/placeholder/600/600',
    caption: 'Detailed mandala back piece, 8-hour session.',
    likes: 412,
    comments: 31,
    timestamp: '2025-03-22T14:20:00',
    tags: ['mandala', 'blackwork', 'detailed', 'backpiece']
  },
  {
    id: 6,
    artistId: 106,
    artistName: 'NeoTradQueen',
    artistProfilePic: '/api/placeholder/100/100',
    image: '/api/placeholder/600/600',
    caption: 'Neo-traditional fox with floral elements.',
    likes: 267,
    comments: 15,
    timestamp: '2025-03-21T16:10:00',
    tags: ['neotraditional', 'fox', 'floral']
  }
];

// Single post component
const Post = ({ post, isGrid }) => {
  if (isGrid) {
    return (
      <div className="relative group cursor-pointer">
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
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-md mb-6">
      {/* Post Header */}
      <div className="flex items-center p-3">
        <img 
          src={post.artistProfilePic} 
          alt={post.artistName} 
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="ml-3">
          <p className="font-semibold">{post.artistName}</p>
        </div>
      </div>
      
      {/* Post Image */}
      <img 
        src={post.image} 
        alt={post.caption} 
        className="w-full object-cover"
      />
      
      {/* Post Actions */}
      <div className="p-3">
        <div className="flex items-center mb-3">
          <button className="mr-4">❤️</button>
          <button className="mr-4">💬</button>
          <button>🔖</button>
        </div>
        <p className="font-semibold mb-1">{post.likes} likes</p>
        <p>
          <span className="font-semibold">{post.artistName}</span> {post.caption}
        </p>
        <p className="text-gray-500 text-sm mt-1">
          View all {post.comments} comments
        </p>
        <p className="text-gray-400 text-xs mt-2">
          {new Date(post.timestamp).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

const HomeFeed = () => {
  // View modes: 'feed' (1 post per row), 'grid3' (3 posts per row), 'grid5' (5 posts per row)
  const [viewMode, setViewMode] = useState('feed');
  
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      {/* View Mode Selector */}
      <div className="flex justify-end mb-6">
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
      
      {/* Feed View */}
      {viewMode === 'feed' && (
        <div className="max-w-xl mx-auto">
          {mockPosts.map(post => (
            <Post key={post.id} post={post} isGrid={false} />
          ))}
        </div>
      )}
      
      {/* Grid Views */}
      {viewMode !== 'feed' && (
        <div className={`grid ${viewMode === 'grid3' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'} gap-1`}>
          {mockPosts.map(post => (
            <Post key={post.id} post={post} isGrid={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeFeed;