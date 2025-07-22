import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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
  
  // User endpoints
  getCurrentUser: () => api.get('/users/me'),
  getUserById: (id) => api.get(`/users/${id}`),
  getUserPosts: (id) => api.get(`/users/${id}/posts`),
  updateProfile: (userData) => api.put('/users/update', userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  followUser: (id) => api.put(`/users/follow/${id}`),     // ADDED
  unfollowUser: (id) => api.put(`/users/unfollow/${id}`), // ADDED

  //Profile Pic
  updateProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('profilePic', file);
    return api.put('/users/profile-picture', formData);
  },
  
  // Post endpoints
  getPosts: () => api.get('/posts'),
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
  deletePost: (id) => api.delete(`/posts/${id}`)
};