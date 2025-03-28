import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LayoutGrid, Grid, BarChart2, MapPin, DollarSign, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ArtistProfile = () => {
  const [viewMode, setViewMode] = useState('grid3');
  const [artistData, setArtistData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  
  const { id } = useParams();
  const { currentUser } = useAuth();
  
  // Fetch artist data
  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true);
        
        // Fetch artist profile
        const profileResponse = await fetch(`http://localhost:5000/api/users/${id}`, {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        
        if (!profileResponse.ok) {
          throw new Error('Failed to fetch artist profile');
        }
        
        const artistData = await profileResponse.json();
        setArtistData(artistData);
        setFollowersCount(artistData.followers?.length || 0);
        
        // Check if current user is following this artist
        if (currentUser && artistData.followers) {
          setFollowing(artistData.followers.includes(currentUser.id));
        }
        
        // Fetch artist posts
        const postsResponse = await fetch(`http://localhost:5000/api/users/${id}/posts`, {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        
        if (!postsResponse.ok) {
          throw new Error('Failed to fetch artist posts');
        }
        
        const postsData = await postsResponse.json();
        setPosts(postsData);
        
      } catch (error) {
        console.error('Error fetching artist data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArtistData();
  }, [id, currentUser]);
  
  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!currentUser) {
      // Redirect to login if not authenticated
      return;
    }
    
    try {
      const endpoint = following ? 'unfollow' : 'follow';
      
      const response = await fetch(`http://localhost:5000/api/users/${endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${endpoint} artist`);
      }
      
      // Update state based on action
      if (following) {
        setFollowersCount(prev => prev - 1);
      } else {
        setFollowersCount(prev => prev + 1);
      }
      
      setFollowing(!following);
      
    } catch (error) {
      console.error(`Error ${following ? 'unfollowing' : 'following'} artist:`, error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!artistData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Artist Not Found</h2>
          <p>The artist you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-screen-xl mx-auto pb-16">
      {/* Profile Header */}
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          {/* Profile Picture */}
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden flex-shrink-0 mb-4 md:mb-0 md:mr-8">
            <img 
              src={`http://localhost:5000/${artistData.profilePic}` || '/api/placeholder/150/150'} 
              alt={artistData.username} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Profile Info */}
          <div className="flex-grow text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center mb-4">
              <h1 className="text-2xl font-bold mr-4">{artistData.username}</h1>
              {/* Follow button */}
              {currentUser && currentUser.id !== artistData._id && (
                <button 
                  className={`${following ? 'bg-gray-200 text-gray-800' : 'bg-blue-500 text-white'} px-4 py-2 rounded-md font-medium mt-2 md:mt-0`}
                  onClick={handleFollowToggle}
                >
                  {following ? 'Following' : 'Follow Artist'}
                </button>
              )}
            </div>
            
            <div className="flex justify-center md:justify-start space-x-6 mb-4">
              <span><b>{posts.length}</b> posts</span>
              <span><b>{followersCount}</b> followers</span>
              <span><b>{artistData.following?.length || 0}</b> following</span>
            </div>
            
            <div className="mb-2">
              <p>{artistData.bio}</p>
            </div>
            
            <div className="flex flex-col space-y-1">
              {artistData.location && (
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2" />
                  <span>{artistData.location}</span>
                </div>
              )}
              
              {artistData.priceRange && (
                <div className="flex items-center">
                  <DollarSign size={16} className="mr-2" />
                  <span>Price Range: {artistData.priceRange}</span>
                </div>
              )}
              
              {artistData.styles && artistData.styles.length > 0 && (
                <div className="flex items-center">
                  <Tag size={16} className="mr-2" />
                  <span>Styles: {artistData.styles.join(', ')}</span>
                </div>
              )}
              
              {artistData.shop && (
                <div className="flex items-center">
                  <Link to={`/shop/${artistData.shop}`} className="text-blue-500">
                    Working at: {artistData.shopName || 'Tattoo Shop'}
                  </Link>
                </div>
              )}
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
      
      {/* No posts message */}
      {posts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500">No posts yet</p>
        </div>
      )}
      
      {/* Posts Grid */}
      {posts.length > 0 && (
        <div className={`grid ${
          viewMode === 'feed' 
            ? 'grid-cols-1 max-w-xl mx-auto gap-6 p-4' 
            : viewMode === 'grid3' 
              ? 'grid-cols-3 gap-1' 
              : 'grid-cols-5 gap-1'
        }`}>
          {posts.map(post => (
            <div key={post._id} className="relative group cursor-pointer">
              <img 
                src={`http://localhost:5000/${post.image}`} 
                alt={post.caption} 
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <div className="flex items-center mr-4">
                  <span className="mr-2">❤️</span> {post.likes.length}
                </div>
                <div className="flex items-center">
                  <span className="mr-2">💬</span> {post.comments.length}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtistProfile;