// src/components/UploadPost.jsx
import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Hash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const UploadPost = ({ onClose }) => {
  const { currentUser } = useAuth();
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Select image, 2: Add details
  
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
      alert('Please select an image');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await api.createPost({
        image: selectedImage,
        caption,
        tags
      });
      
      onClose();
      // Show success message
      alert('Your post was uploaded successfully!');
      
      // Could refresh the feed here
    } catch (error) {
      console.error('Error uploading post:', error);
      alert('Failed to upload post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rest of component remains unchanged
  // ...
};

export default UploadPost;