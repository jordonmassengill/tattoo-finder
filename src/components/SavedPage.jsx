import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Heart, MessageCircle, Search, Filter, Bookmark, MapPin, Users, Image } from 'lucide-react';
import CommentModal from './CommentModal';
import ProfileImage from './ProfileImage';
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

const formatNum = (n) => {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
};

const profileUrl = (user) => {
  if (!user?.username) return '/';
  return user.userType === 'shop' ? `/shop/${user.username}` : `/artist/${user.username}`;
};

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

const EMPTY_POST_FILTERS = {
  colorType: '',
  flashOrCustom: '',
  size: '',
  location: [],
  foundationalStyles: [],
  techniques: [],
  subjects: [],
};

const EMPTY_ARTIST_FILTERS = {
  inkSpecialty: '',
  designSpecialty: '',
  priceRange: [],
  location: [],
  foundationalStyleSpecialties: [],
  techniqueSpecialties: [],
  subjectSpecialties: [],
};

const SavedPage = () => {
  // Posts tab
  const [savedPosts, setSavedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [postFilters, setPostFilters] = useState(EMPTY_POST_FILTERS);
  const [postQuery, setPostQuery] = useState('');
  const [submittedPostQuery, setSubmittedPostQuery] = useState('');
  const [postSortOption, setPostSortOption] = useState('new');
  const [followingSortOption, setFollowingSortOption] = useState('recent');

  // Following tab
  const [followedUsers, setFollowedUsers] = useState([]);
  const [filteredFollowing, setFilteredFollowing] = useState([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [followingQuery, setFollowingQuery] = useState('');
  const [submittedFollowingQuery, setSubmittedFollowingQuery] = useState('');
  const [artistFilters, setArtistFilters] = useState(EMPTY_ARTIST_FILTERS);

  // Shared
  const [viewTab, setViewTab] = useState('posts');
  const [showFilters, setShowFilters] = useState(false);

  // Load saved posts once
  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        setLoadingPosts(true);
        const response = await api.getSavedPosts();
        setSavedPosts(response.data);
        setFilteredPosts(response.data);
      } catch (error) {
        console.error('Error fetching saved posts:', error);
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchSavedPosts();
  }, []);

  // Load followed users when switching to that tab
  useEffect(() => {
    if (viewTab !== 'following' || followedUsers.length > 0) return;
    const fetchFollowing = async () => {
      try {
        setLoadingFollowing(true);
        const response = await api.getFollowing();
        setFollowedUsers(response.data);
      } catch (error) {
        console.error('Error fetching following:', error);
      } finally {
        setLoadingFollowing(false);
      }
    };
    fetchFollowing();
  }, [viewTab, followedUsers.length]);

  // Filter posts
  useEffect(() => {
    let posts = [...savedPosts];
    if (submittedPostQuery) {
      const q = submittedPostQuery.toLowerCase();
      posts = posts.filter(post =>
        post.caption?.toLowerCase().includes(q) ||
        post.user?.username?.toLowerCase().includes(q) ||
        post.tags?.some(tag => tag.toLowerCase().includes(q))
      );
    }
    if (postFilters.colorType) posts = posts.filter(p => p.colorType === postFilters.colorType);
    if (postFilters.flashOrCustom) posts = posts.filter(p => p.flashOrCustom === postFilters.flashOrCustom);
    if (postFilters.size) posts = posts.filter(p => p.size === postFilters.size);
    if (postFilters.location.length > 0) posts = posts.filter(p => p.user?.location && postFilters.location.includes(p.user.location));
    if (postFilters.foundationalStyles.length > 0) posts = posts.filter(p => p.foundationalStyles?.some(s => postFilters.foundationalStyles.includes(s)));
    if (postFilters.techniques.length > 0) posts = posts.filter(p => p.techniques?.some(t => postFilters.techniques.includes(t)));
    if (postFilters.subjects.length > 0) posts = posts.filter(p => p.subjects?.some(s => postFilters.subjects.includes(s)));

    if (postSortOption === 'likes') {
      posts.sort((a, b) => b.likes.length - a.likes.length);
    } else if (postSortOption === 'new') {
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    // 'recent' = preserve server order (most recently saved)
    setFilteredPosts(posts);
  }, [submittedPostQuery, postFilters, postSortOption, savedPosts]);

  // Filter following
  useEffect(() => {
    let users = [...followedUsers];
    if (submittedFollowingQuery) {
      const q = submittedFollowingQuery.toLowerCase();
      users = users.filter(u => u.username?.toLowerCase().includes(q) || u.location?.toLowerCase().includes(q));
    }
    if (artistFilters.inkSpecialty) users = users.filter(u => u.inkSpecialty === artistFilters.inkSpecialty);
    if (artistFilters.designSpecialty) users = users.filter(u => u.designSpecialty === artistFilters.designSpecialty);
    if (artistFilters.priceRange.length > 0) users = users.filter(u => artistFilters.priceRange.includes(u.priceRange));
    if (artistFilters.location.length > 0) users = users.filter(u => artistFilters.location.includes(u.location));
    if (artistFilters.foundationalStyleSpecialties.length > 0) users = users.filter(u => u.foundationalStyleSpecialties?.some(s => artistFilters.foundationalStyleSpecialties.includes(s)));
    if (artistFilters.techniqueSpecialties.length > 0) users = users.filter(u => u.techniqueSpecialties?.some(t => artistFilters.techniqueSpecialties.includes(t)));
    if (artistFilters.subjectSpecialties.length > 0) users = users.filter(u => u.subjectSpecialties?.some(s => artistFilters.subjectSpecialties.includes(s)));

    if (followingSortOption === 'followers') {
      users.sort((a, b) => (b.followers?.length || 0) - (a.followers?.length || 0));
    } else {
      users.reverse(); // server returns oldest-first; flip to most-recently-followed at top
    }
    setFilteredFollowing(users);
  }, [submittedFollowingQuery, artistFilters, followedUsers, followingSortOption]);

  // Toggle helpers
  const togglePostSingle = (key, value) => setPostFilters(prev => ({ ...prev, [key]: prev[key] === value ? '' : value }));
  const togglePostArray = (key, value) => setPostFilters(prev => ({
    ...prev,
    [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value],
  }));

  const toggleArtistSingle = (key, value) => setArtistFilters(prev => ({ ...prev, [key]: prev[key] === value ? '' : value }));
  const toggleArtistArray = (key, value) => setArtistFilters(prev => ({
    ...prev,
    [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value],
  }));

  const resetPostFilters = () => { setPostFilters(EMPTY_POST_FILTERS); setPostQuery(''); setSubmittedPostQuery(''); };
  const resetArtistFilters = () => { setArtistFilters(EMPTY_ARTIST_FILTERS); setFollowingQuery(''); setSubmittedFollowingQuery(''); };

  const postActiveFilterCount = [
    postFilters.colorType, postFilters.flashOrCustom, postFilters.size,
    ...postFilters.location, ...postFilters.foundationalStyles, ...postFilters.techniques, ...postFilters.subjects,
  ].filter(Boolean).length;

  const artistActiveFilterCount = [
    artistFilters.inkSpecialty, artistFilters.designSpecialty,
    ...artistFilters.priceRange, ...artistFilters.location,
    ...artistFilters.foundationalStyleSpecialties, ...artistFilters.techniqueSpecialties, ...artistFilters.subjectSpecialties,
  ].filter(Boolean).length;

  const activeFilterCount = viewTab === 'posts' ? postActiveFilterCount : artistActiveFilterCount;

  // Sub-components
  const EitherOrRow = ({ label, options, filterKey, onToggle, active }) => (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="flex gap-2">
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => onToggle(filterKey, opt)}
            className={`flex-1 py-1.5 text-sm rounded-full border font-medium transition-colors ${active(filterKey, opt) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  const ChipGroup = ({ label, options, filterKey, onToggle, active }) => (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => onToggle(filterKey, opt)}
            className={`px-2.5 py-1 text-xs rounded-full border font-medium transition-colors ${active(filterKey, opt) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  const handleTabSwitch = (tab) => {
    setViewTab(tab);
    setShowFilters(false);
  };

  const currentQuery = viewTab === 'posts' ? postQuery : followingQuery;
  const setCurrentQuery = viewTab === 'posts' ? setPostQuery : setFollowingQuery;
  const handleSearch = () => {
    if (viewTab === 'posts') setSubmittedPostQuery(postQuery.trim());
    else setSubmittedFollowingQuery(followingQuery.trim());
  };

  return (
    <div className="max-w-screen-xl mx-auto p-8">
      {/* Title (left) + Posts / Following toggle (centered) */}
      <div className="grid grid-cols-3 items-center mb-6">
        <h1 className="text-3xl font-bold">Saved</h1>
        <div className="flex justify-center">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button type="button" onClick={() => handleTabSwitch('posts')}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-l-lg ${viewTab === 'posts' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'}`}>
              <Image size={16} className="mr-2" /> Posts
            </button>
            <button type="button" onClick={() => handleTabSwitch('following')}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-r-lg ${viewTab === 'following' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'}`}>
              <Users size={16} className="mr-2" /> Following
            </button>
          </div>
        </div>
        <div />
      </div>

      {/* Search + filters bar */}
      <div className="flex flex-col md:flex-row items-center mb-6">
        <div className="relative flex-grow w-full mb-4 md:mb-0 md:mr-4">
          <input
            type="text"
            placeholder={viewTab === 'posts' ? 'Search in saved posts...' : 'Search followed artists & shops...'}
            className="w-full pl-10 pr-24 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={currentQuery}
            onChange={(e) => setCurrentQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <button onClick={handleSearch}
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
          {viewTab === 'posts' && (
            <button
              onClick={() => setPostSortOption(prev => prev === 'new' ? 'recent' : prev === 'recent' ? 'likes' : 'new')}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium whitespace-nowrap">
              {postSortOption === 'new' ? 'Sort - New' : postSortOption === 'recent' ? 'Sort - Recent' : 'Sort - Likes'}
            </button>
          )}
          {viewTab === 'following' && (
            <button
              onClick={() => setFollowingSortOption(prev => prev === 'recent' ? 'followers' : 'recent')}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium whitespace-nowrap">
              {followingSortOption === 'recent' ? 'Sort - Recent' : 'Sort - Followers'}
            </button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-5 mb-6 border border-gray-200">
          <h3 className="font-semibold mb-4 text-center">Filter Options</h3>

          {viewTab === 'posts' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <div>
                <EitherOrRow label="Ink" options={COLOR_TYPES} filterKey="colorType" onToggle={togglePostSingle} active={(k, v) => postFilters[k] === v} />
                <EitherOrRow label="Design" options={FLASH_OR_CUSTOM} filterKey="flashOrCustom" onToggle={togglePostSingle} active={(k, v) => postFilters[k] === v} />
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Size</p>
                  <div className="flex gap-2">
                    {SIZES.map(s => (
                      <button key={s} type="button" onClick={() => togglePostSingle('size', s)}
                        className={`flex-1 py-1.5 text-sm rounded-full border font-medium transition-colors ${postFilters.size === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'}`}>
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
                        <input type="checkbox" checked={postFilters.location.includes(city)} onChange={() => togglePostArray('location', city)} className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600" />
                        {city}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <ChipGroup label="Foundational Style" options={FOUNDATIONAL_STYLES} filterKey="foundationalStyles" onToggle={togglePostArray} active={(k, v) => postFilters[k].includes(v)} />
                <ChipGroup label="Technique / Finish" options={TECHNIQUES} filterKey="techniques" onToggle={togglePostArray} active={(k, v) => postFilters[k].includes(v)} />
                <ChipGroup label="Subject" options={SUBJECTS} filterKey="subjects" onToggle={togglePostArray} active={(k, v) => postFilters[k].includes(v)} />
              </div>
            </div>
          ) : (
            /* Following tab filters */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <div>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Ink</p>
                  <div className="flex gap-2">
                    {[{ label: 'Black/Grey', value: 'Black/Grey Specialty' }, { label: 'Color', value: 'Color Specialty' }].map(({ label, value }) => (
                      <button key={value} type="button" onClick={() => toggleArtistSingle('inkSpecialty', value)}
                        className={`flex-1 py-1.5 text-sm rounded-full border font-medium transition-colors ${artistFilters.inkSpecialty === value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Design</p>
                  <div className="flex gap-2">
                    {[{ label: 'Flash', value: 'Flash Specialty' }, { label: 'Custom', value: 'Custom Specialty' }].map(({ label, value }) => (
                      <button key={value} type="button" onClick={() => toggleArtistSingle('designSpecialty', value)}
                        className={`flex-1 py-1.5 text-sm rounded-full border font-medium transition-colors ${artistFilters.designSpecialty === value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Price</p>
                  <div className="flex gap-2">
                    {['$', '$$', '$$$', '$$$$'].map(price => (
                      <button key={price} type="button" onClick={() => toggleArtistArray('priceRange', price)}
                        className={`flex-1 py-1.5 text-sm rounded-full border font-medium transition-colors ${artistFilters.priceRange.includes(price) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'}`}>
                        {price}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</p>
                  <div className="grid grid-cols-2 gap-x-2">
                    {BAY_AREA_CITIES.map(city => (
                      <label key={city} className="flex items-center text-sm py-0.5 px-1 hover:bg-gray-100 rounded cursor-pointer">
                        <input type="checkbox" checked={artistFilters.location.includes(city)} onChange={() => toggleArtistArray('location', city)} className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600" />
                        {city}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <ChipGroup label="Foundational Style" options={FOUNDATIONAL_STYLES} filterKey="foundationalStyleSpecialties" onToggle={toggleArtistArray} active={(k, v) => artistFilters[k].includes(v)} />
                <ChipGroup label="Technique / Finish" options={TECHNIQUES} filterKey="techniqueSpecialties" onToggle={toggleArtistArray} active={(k, v) => artistFilters[k].includes(v)} />
                <ChipGroup label="Subject" options={SUBJECTS} filterKey="subjectSpecialties" onToggle={toggleArtistArray} active={(k, v) => artistFilters[k].includes(v)} />
              </div>
            </div>
          )}

          <div className="flex justify-end mt-4 space-x-2 border-t pt-3">
            <button className="px-4 py-2 text-sm rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400"
              onClick={viewTab === 'posts' ? resetPostFilters : resetArtistFilters}>Reset</button>
            <button className="px-4 py-2 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => setShowFilters(false)}>Apply</button>
          </div>
        </div>
      )}

      {/* Posts tab content */}
      {viewTab === 'posts' && (
        <>
          {loadingPosts && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}
          {!loadingPosts && savedPosts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">You haven't saved any posts yet.</p>
              <p className="text-gray-400 mt-2">Click the bookmark icon on a post to save it here.</p>
            </div>
          )}
          {!loadingPosts && savedPosts.length > 0 && filteredPosts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">No saved posts match your filters.</p>
              <p className="text-gray-400 mt-2">Try adjusting your search or click Reset.</p>
            </div>
          )}
          {!loadingPosts && filteredPosts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredPosts.map(post => (
                <PostItem key={post._id} post={post} onPostClick={setSelectedPost} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Following tab content */}
      {viewTab === 'following' && (
        <>
          {loadingFollowing && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}
          {!loadingFollowing && followedUsers.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">You're not following anyone yet.</p>
              <p className="text-gray-400 mt-2">Follow artists and shops to see them here.</p>
            </div>
          )}
          {!loadingFollowing && followedUsers.length > 0 && filteredFollowing.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">No followed users match your filters.</p>
              <p className="text-gray-400 mt-2">Try adjusting your search or click Reset.</p>
            </div>
          )}
          {!loadingFollowing && filteredFollowing.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredFollowing.map(user => (
                <div key={user._id} className="relative group">
                  <Link to={profileUrl(user)} className="block">
                    <div className="aspect-square relative overflow-hidden rounded-lg border border-gray-200">
                      <ProfileImage user={user} size="xl" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 flex flex-col justify-end">
                        <h3 className="font-bold text-white text-lg">{user.username}</h3>
                        {user.location && (
                          <div className="flex items-center text-white/90 text-sm">
                            <MapPin size={12} className="mr-1 flex-shrink-0" />
                            <span className="truncate">{user.location}</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full capitalize">
                        {user.userType}
                      </div>
                      <div className="absolute bottom-3 right-3 flex flex-col items-end gap-0.5">
                        <div className="flex items-center text-white/90 text-xs drop-shadow">
                          <span className="mr-1">{formatNum(user.followers?.length || 0)}</span>
                          <Users size={11} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selectedPost && (
        <CommentModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
};

export default SavedPage;
