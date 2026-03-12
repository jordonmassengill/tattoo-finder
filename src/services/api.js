import axios from 'axios';

const API_URL = 'https://tattoo-finder-backend-production.up.railway.app/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL
});

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export default {
  // Auth endpoints
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (userData) => api.post('/auth/register', userData),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  
  // User endpoints
  getCurrentUser: () => api.get('/users/me'),
  getUserById: (id) => api.get(`/users/${id}`),
  getUserPosts: (id, options = {}) => {
    const params = new URLSearchParams();
    if (options.includeArtists) params.set('includeArtists', 'true');
    if (options.page) params.set('page', options.page);
    const query = params.toString();
    return api.get(`/users/${id}/posts${query ? '?' + query : ''}`);
  },
  updateProfile: (userData) => api.put('/users/update', userData),
  changePassword: (currentPassword, newPassword) => api.put('/users/change-password', { currentPassword, newPassword }),
  deleteUser: (id) => api.delete(`/users/${id}`),
  followUser: (id) => api.put(`/users/follow/${id}`),
  unfollowUser: (id) => api.put(`/users/unfollow/${id}`),

  // Save fucntions
  savePost: (postId) => api.put(`/users/save/${postId}`),
  unsavePost: (postId) => api.put(`/users/unsave/${postId}`),
  getSavedPosts: () => api.get('/users/me/saved'),
  getFollowing: () => api.get('/users/me/following'),

  //Profile Pic
  updateProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('profilePic', file);
    return api.put('/users/profile-picture', formData);
  },
  
  // Post endpoints
  getPosts: (page = 1) => api.get(`/posts?page=${page}`),
  getPostById: (id) => api.get(`/posts/${id}`),
  createPost: (postData) => {
    const formData = new FormData();
    formData.append('image', postData.image);
    formData.append('caption', postData.caption);
    if (postData.tags) formData.append('tags', postData.tags.join(','));
    return api.post('/posts', formData);
  },
  likePost: (id) => api.put(`/posts/like/${id}`),
  unlikePost: (id) => api.put(`/posts/unlike/${id}`),
  addComment: (id, text) => api.post(`/posts/comment/${id}`, { text }),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),

  deleteComment: (postId, commentId) => api.delete(`/posts/comment/${postId}/${commentId}`),
  likeComment: (postId, commentId) => api.put(`/posts/comment/like/${postId}/${commentId}`),
  unlikeComment: (postId, commentId) => api.put(`/posts/comment/unlike/${postId}/${commentId}`),
  
  // These are the functions for the dislike feature
  dislikeComment: (postId, commentId) => api.put(`/posts/comment/dislike/${postId}/${commentId}`),
  undislikeComment: (postId, commentId) => api.put(`/posts/comment/undislike/${postId}/${commentId}`),

  // Affiliation endpoints
  sendAffiliationRequest: (targetId) => api.post(`/affiliations/request/${targetId}`),
  acceptAffiliationRequest: (requestId) => api.put(`/affiliations/accept/${requestId}`),
  declineAffiliationRequest: (requestId) => api.delete(`/affiliations/request/${requestId}`),
  removeAffiliation: (targetId) => api.delete(`/affiliations/remove/${targetId}`),
  getPendingAffiliationRequests: () => api.get('/affiliations/pending'),
  getAffiliationStatus: (targetId) => api.get(`/affiliations/status/${targetId}`),
};
