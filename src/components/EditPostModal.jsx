import React, { useState } from 'react';
import { X, Hash, Save } from 'lucide-react';
import {
  COLOR_TYPES,
  SIZES,
  STYLES,
  SUBJECTS,
} from '../constants/tattooCategories';

const EditPostModal = ({ post, onClose, onPostUpdated }) => {
  const [caption, setCaption] = useState(post.caption || '');
  const [tags, setTags] = useState(post.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [colorType, setColorType] = useState(post.colorType || '');
  const [flashType, setFlashType] = useState(post.flashOrCustom || '');
  const [size, setSize] = useState(post.size || '');
  const [styles, setStyles] = useState(post.styles || []);
  const [subjects, setSubjects] = useState(post.subjects || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddTag = () => {
    const trimmed = currentTag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 3) {
      setTags([...tags, trimmed]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => setTags(tags.filter(t => t !== tagToRemove));

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const toggleSingle = (setter, current, value) => setter(current === value ? '' : value);

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
    setIsSubmitting(true);
    setError('');
    try {
      const response = await fetch(`https://tattoo-finder-backend-production.up.railway.app/api/posts/${post._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token'),
        },
        body: JSON.stringify({ caption, tags, colorType, flashOrCustom: flashType, size, styles, subjects }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update post');
      }
      const updatedPost = await response.json();
      onPostUpdated(updatedPost);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const EitherOrRow = ({ label, options, value, onChange }) => (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      <div className="flex rounded-full border border-gray-300 overflow-hidden">
        {options.map((opt, i) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`flex-1 py-1.5 text-sm font-medium transition-colors ${i > 0 ? 'border-l border-gray-300 ' : ''}${value === opt ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

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
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold">Edit Post</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 mx-4 mt-3 rounded">{error}</div>
        )}

        <div className="flex flex-col md:flex-row">
          {/* Image preview (read-only) */}
          <div className="md:w-1/2 p-4 flex items-center justify-center bg-black min-h-[400px]">
            <img
              src={`https://tattoo-finder-backend-production.up.railway.app/${post.image}`}
              alt="Post"
              className="w-full max-h-[520px] object-contain"
            />
          </div>

          {/* Edit form */}
          <div className="md:w-1/2 p-4 overflow-y-auto">
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full p-2 border rounded-md resize-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                rows={2}
                placeholder="Write a caption..."
              />
            </div>

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

            <EitherOrRow
              label="Ink"
              options={COLOR_TYPES}
              value={colorType}
              onChange={(v) => toggleSingle(setColorType, colorType, v)}
            />

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Size</label>
              <div className="flex rounded-full border border-gray-300 overflow-hidden">
                {SIZES.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSingle(setSize, size, s)}
                    className={`flex-1 py-1.5 text-sm font-medium transition-colors ${i > 0 ? 'border-l border-gray-300 ' : ''}${size === s ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

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

            <div className="flex justify-between pt-2 border-t mt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-500 text-white px-4 py-2 rounded-md font-medium flex items-center disabled:bg-blue-300 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2">Saving...</span>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  </>
                ) : (
                  <>
                    <span className="mr-2">Save Changes</span>
                    <Save size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
