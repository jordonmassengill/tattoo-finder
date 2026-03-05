// src/components/UploadPost.jsx
import React, { useState, useRef } from 'react';
import { X, Upload, Hash, Image } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  COLOR_TYPES,
  SIZES,
  STYLES,
  SUBJECTS,
} from '../constants/tattooCategories';

const UploadPost = ({ onClose, onPostCreated }) => {
  const { currentUser } = useAuth();

  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  // Category state
  const [colorType, setColorType] = useState('');   // 'Black/Grey' | 'Color' | ''
  const [flashType, setFlashType] = useState('');   // 'Flash Sheet' | 'Tattoo Work' | ''
  const [size, setSize] = useState('');             // 'Small' | 'Medium' | 'Large' | ''
  const [styles, setStyles] = useState([]);         // up to 2
  const [subjects, setSubjects] = useState([]);     // up to 2

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      setStep(2);
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim().toLowerCase()) && tags.length < 3) {
      setTags([...tags, currentTag.trim().toLowerCase()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Toggle for either/or buttons (colorType, flashOrCustom, size)
  const toggleSingle = (setter, current, value) => {
    setter(current === value ? '' : value);
  };

  // Toggle for multi-select arrays (up to 2)
  const toggleMulti = (setter, current, value, label) => {
    if (current.includes(value)) {
      setter(current.filter(s => s !== value));
    } else if (current.length < 2) {
      setter([...current, value]);
    } else {
      setError(`You can only select up to 2 ${label}`);
      setTimeout(() => setError(''), 3000);
    }
  };

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
      if (tags.length > 0) formData.append('tags', tags.join(','));
      if (colorType) formData.append('colorType', colorType);
      if (flashType) formData.append('flashOrCustom', flashType);
      if (size) formData.append('size', size);
      if (styles.length > 0) formData.append('styles', styles.join(','));
      if (subjects.length > 0) formData.append('subjects', subjects.join(','));

      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: { 'x-auth-token': localStorage.getItem('token') },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to upload post';
        try {
          const text = await response.text();
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorMessage;
        } catch {
          // response was not JSON (e.g. HTML error page), use default message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      onClose();
      if (typeof onPostCreated === 'function') onPostCreated(data);
      alert('Your post was uploaded successfully!');
    } catch (err) {
      console.error('Error uploading post:', err);
      setError(err.message || 'Failed to upload post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reusable either/or toggle row
  const EitherOrRow = ({ label, options, value, onChange }) => (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      <div className="flex gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`flex-1 py-1.5 text-sm rounded-full border font-medium transition-colors ${
              value === opt
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  // Reusable multi-select chip row (up to 2)
  const MultiSelectGroup = ({ label, options, selected, onToggle }) => (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        {label} <span className="font-normal text-gray-400">(up to 2)</span>
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`px-2.5 py-1 text-xs rounded-full border font-medium transition-colors ${
              selected.includes(opt)
                ? 'bg-indigo-600 text-white border-indigo-600'
                : selected.length >= 2
                ? 'bg-white text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
            }`}
            disabled={!selected.includes(opt) && selected.length >= 2}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold">
            {step === 1 ? 'Create New Post' : 'Add Post Details'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-100 text-red-700 mx-4 mt-3 rounded">
            {error}
          </div>
        )}

        {/* Step 1: Select Image */}
        {step === 1 && (
          <div className="p-6 flex flex-col items-center">
            <div className="mb-8 text-center">
              <Image size={48} className="mx-auto mb-2 text-gray-400" />
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
                className="bg-blue-500 text-white px-4 py-2 rounded-md font-medium w-full"
              >
                Select from device
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Add Details */}
        {step === 2 && (
          <div className="flex flex-col md:flex-row">
            {/* Image preview */}
            <div className="md:w-1/2 p-4 flex items-center justify-center bg-black min-h-[400px]">
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-[520px] object-contain"
              />
            </div>

            {/* Post details form */}
            <div className="md:w-1/2 p-4 overflow-y-auto">
              {/* Caption */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Caption
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full p-2 border rounded-md resize-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  rows={2}
                  placeholder="Write a caption..."
                />
              </div>

              {/* Either/or selectors */}
              <EitherOrRow
                label="Ink"
                options={COLOR_TYPES}
                value={colorType}
                onChange={(v) => toggleSingle(setColorType, colorType, v)}
              />

              {/* Size - single select */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Size</label>
                <div className="flex gap-2">
                  {SIZES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSingle(setSize, size, s)}
                      className={`flex-1 py-1.5 text-sm rounded-full border font-medium transition-colors ${
                        size === s
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Multi-select groups */}
              <MultiSelectGroup
                label="Style"
                options={STYLES}
                selected={styles}
                onToggle={(v) => toggleMulti(setStyles, styles, v, 'styles')}
              />
              <MultiSelectGroup
                label="Subject"
                options={SUBJECTS}
                selected={subjects}
                onToggle={(v) => toggleMulti(setSubjects, subjects, v, 'subjects')}
              />

              {/* Flash Sheet / Tattoo Work toggle */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Type</label>
                <div className="flex rounded-full border border-gray-300 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setFlashType(flashType === 'Tattoo Work' ? '' : 'Tattoo Work')}
                    className={`flex-1 py-1.5 text-sm font-medium transition-colors ${flashType === 'Tattoo Work' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    Tattoo Work
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlashType(flashType === 'Flash Sheet' ? '' : 'Flash Sheet')}
                    className={`flex-1 py-1.5 text-sm font-medium transition-colors border-l border-gray-300 ${flashType === 'Flash Sheet' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    Flash Sheet
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Tags <span className="font-normal text-gray-400 normal-case">(max 3)</span>
                </label>
                <div className="flex mb-2">
                  <div className="relative flex-grow">
                    <Hash size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      className="w-full pl-7 pr-3 py-1.5 border rounded-l-md text-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add a tag..."
                      disabled={tags.length >= 3}
                    />
                  </div>
                  <button
                    onClick={handleAddTag}
                    disabled={tags.length >= 3}
                    className="bg-blue-500 text-white px-3 py-1.5 rounded-r-md text-sm disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(tag => (
                    <div key={tag} className="flex items-center bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                      #{tag}
                      <button onClick={() => handleRemoveTag(tag)} className="ml-1 text-blue-600 hover:text-blue-800">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-2 border-t mt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md font-medium flex items-center disabled:bg-blue-300 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2">Uploading...</span>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    </>
                  ) : (
                    <>
                      <span className="mr-2">Share</span>
                      <Upload size={16} />
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
