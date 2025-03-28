// src/components/UploadPost.jsx
import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Hash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const UploadPost = ({ onClose, onPostCreated }) => {
  const { currentUser } = useAuth();
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Select image, 2: Add details
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);
  
  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Go to next step
      setStep(2);
    }
  };
  
  // Add a tag
  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim().toLowerCase())) {
      setTags([...tags, currentTag.trim().toLowerCase()]);
      setCurrentTag('');
    }
  };
  
  // Remove a tag
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Handle tag input keypress (add tag on Enter)
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  // Submit the post
  const handleSubmit = async () => {
    if (!selectedImage) {
      setError('Please select an image');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('caption', caption);
      if (tags.length > 0) {
        formData.append('tags', tags.join(','));
      }
      
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload post');
      }
      
      const data = await response.json();
      console.log('Post created:', data);
      
      onClose();
      if (typeof onPostCreated === 'function') {
        onPostCreated(data);
      }
      
      // Show success message
      alert('Your post was uploaded successfully!');
    } catch (error) {
      console.error('Error uploading post:', error);
      setError(error.message || 'Failed to upload post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // For demo mode (using placeholder image)
  const handlePlaceholderImage = () => {
    fetch('/api/placeholder/600/600')
      .then(response => response.blob())
      .then(blob => {
        const file = new File([blob], 'placeholder.jpg', { type: 'image/jpeg' });
        setSelectedImage(file);
        setPreview(URL.createObjectURL(file));
        setStep(2);
      })
      .catch(error => {
        console.error('Error fetching placeholder:', error);
        setError('Could not load placeholder image');
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {step === 1 ? 'Create New Post' : 'Add Post Details'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-100 text-red-700 m-3 rounded">
            {error}
          </div>
        )}
        
        {/* Step 1: Select Image */}
        {step === 1 && (
          <div className="p-6 flex flex-col items-center">
            <div className="mb-8 text-center">
              <Camera size={48} className="mx-auto mb-2 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Upload your artwork</h3>
              <p className="text-gray-500 mb-4">Share your latest tattoo designs with your followers</p>
              
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current.click()}
                className="bg-blue-500 text-white px-4 py-2 rounded-md font-medium mb-2 w-full"
              >
                Select from device
              </button>
              
              <button
                onClick={handlePlaceholderImage}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium w-full"
              >
                Use placeholder (demo)
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Add Details */}
        {step === 2 && (
          <div className="flex flex-col md:flex-row">
            {/* Image preview */}
            <div className="md:w-1/2 p-4 flex items-center justify-center bg-black">
              <img 
                src={preview} 
                alt="Preview" 
                className="max-h-[300px] max-w-full object-contain"
              />
            </div>
            
            {/* Post details form */}
            <div className="md:w-1/2 p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full p-2 border rounded-md resize-none focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Write a caption..."
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex mb-2">
                  <div className="relative flex-grow">
                    <Hash size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      className="w-full pl-8 pr-4 py-2 border rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add a tag..."
                    />
                  </div>
                  <button
                    onClick={handleAddTag}
                    className="bg-blue-500 text-white px-3 py-2 rounded-r-md"
                  >
                    Add
                  </button>
                </div>
                
                {/* Tags display */}
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <div key={tag} className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md font-medium flex items-center disabled:bg-blue-300"
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2">Uploading...</span>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    </>
                  ) : (
                    <>
                      <span className="mr-2">Share</span>
                      <Upload size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPost;