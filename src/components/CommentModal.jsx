// File: src/components/CommentModal.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Send, Trash2, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProfileImage from './ProfileImage';

const CommentModal = ({ post, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localDislikes, setLocalDislikes] = useState(new Set());
  const { currentUser } = useAuth();
  const commentsEndRef = useRef(null);

  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!post?._id) return;
      try {
        setLoading(true);
        const response = await api.getPostById(post._id);
        setComments(response.data.comments || []);
        setLocalDislikes(new Set());
      } catch (error) {
        console.error("Failed to fetch comments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPostDetails();
  }, [post?._id]);

  // **THE FIX IS HERE**
  // Scroll to the bottom only when the NUMBER of comments changes.
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await api.addComment(post._id, newComment.trim());
      setComments(response.data);
      setNewComment('');
    } catch (error) {
      console.error("Failed to post comment", error);
      alert("Could not post your comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await api.deleteComment(post._id, commentId);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Could not delete the comment. Please try again.');
    }
  };

  const handleInteraction = async (commentId, type) => {
    if (!currentUser) return alert("Please log in to interact.");

    const originalComments = [...comments];
    const newDislikes = new Set(localDislikes);
    const comment = comments.find(c => c._id === commentId);
    const isLiked = comment.likes.includes(currentUser.id);
    const isDisliked = newDislikes.has(commentId);

    if (type === 'like') {
      if (isDisliked) newDislikes.delete(commentId);
      
      const newLikes = isLiked
        ? comment.likes.filter(id => id !== currentUser.id)
        : [...comment.likes, currentUser.id];

      setComments(comments.map(c => c._id === commentId ? { ...c, likes: newLikes } : c));
      apiCall(isLiked ? 'unlike' : 'like', post._id, commentId, originalComments);

    } else if (type === 'dislike') {
      let newLikes = [...comment.likes];
      if (isLiked) {
        newLikes = newLikes.filter(id => id !== currentUser.id);
        apiCall('unlike', post._id, commentId, originalComments);
      }
      
      isDisliked ? newDislikes.delete(commentId) : newDislikes.add(commentId);
      setComments(comments.map(c => c._id === commentId ? { ...c, likes: newLikes } : c));
    }
    setLocalDislikes(newDislikes);
  };

  const apiCall = async (action, postId, commentId, originalState) => {
    try {
      if (action === 'like') await api.likeComment(postId, commentId);
      if (action === 'unlike') await api.unlikeComment(postId, commentId);
    } catch (error) {
      console.error(`Failed to ${action} comment`, error);
      setComments(originalState);
    }
  };


  if (!post) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Left Side: Image */}
        <div className="hidden md:block md:w-3/5 bg-black flex-shrink-0">
          <img
            src={`http://localhost:5000/${post.image}`}
            alt={post.caption}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Right Side: Comments */}
        <div className="w-full md:w-2/5 flex flex-col">
          {/* Header */}
          <div className="p-3 border-b flex items-center justify-between">
            <Link to={`/artist/${post.user.username}`} className="flex items-center font-semibold">
              <ProfileImage user={post.user} size="sm" />
              <span className="ml-2">{post.user.username}</span>
            </Link>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>

          {/* Comments Section */}
          <div className="flex-grow p-3 overflow-y-auto">
            {post.caption && (
              <>
                <p className="text-sm mb-3">{post.caption}</p>
                <hr className="mb-3"/>
              </>
            )}

            {/* Comments List */}
            {loading ? (
              <div className="text-center text-gray-500">Loading comments...</div>
            ) : (
              <div className="space-y-4">
                {comments.map(comment => {
                  const isLiked = currentUser && comment.likes.includes(currentUser.id);
                  const isDisliked = localDislikes.has(comment._id);

                  let displayLikes = comment.likes.length;
                  if (isDisliked) displayLikes--;
                  
                  return (
                    <div key={comment._id} className="flex items-start group relative w-full justify-between">
                      <div className="flex items-start flex-grow min-w-0">
                        <ProfileImage user={comment.user} size="sm" />
                        <div className="ml-3 text-sm flex-grow min-w-0">
                          <p className="break-words">
                            <span className="font-semibold">{comment.user.username || 'User'}</span>
                            <span className="ml-1">{comment.text}</span>
                          </p>
                          <div className="flex items-center text-xs text-gray-400 mt-1 space-x-3">
                             <p>{new Date(comment.date).toLocaleDateString()}</p>
                             <button onClick={() => handleInteraction(comment._id, 'like')} className={`font-semibold ${isLiked ? 'text-blue-500' : 'hover:text-gray-600'}`}>
                               Like
                             </button>
                             <button onClick={() => handleInteraction(comment._id, 'dislike')} className={`font-semibold ${isDisliked ? 'text-red-500' : 'hover:text-gray-600'}`}>
                               Dislike
                             </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 pl-2 flex-shrink-0">
                          <div className={`flex items-center ${isLiked ? 'text-red-500' : isDisliked ? 'text-black' : 'text-gray-400'}`}>
                               <Heart size={12} className="mr-1" fill={isLiked || isDisliked ? 'currentColor' : 'none'} />
                               <span>{displayLikes}</span>
                          </div>
                          {currentUser?.id === comment.user?._id && (
                            <button onClick={() => handleDeleteComment(comment._id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={14} />
                            </button>
                          )}
                      </div>
                    </div>
                  );
                })}
                {comments.length === 0 && !loading && (
                    <p className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first!</p>
                )}
                <div ref={commentsEndRef} />
              </div>
            )}
          </div>

          {/* Footer: Add Comment form */}
          <div className="p-3 border-t">
            <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
              <ProfileImage user={currentUser} size="sm" />
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-grow border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                className="text-blue-500 font-semibold disabled:text-blue-300"
                disabled={!newComment.trim() || isSubmitting}
              >
                <Send size={24} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;