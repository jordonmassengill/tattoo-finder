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
  const [interactionLoading, setInteractionLoading] = useState(null);
  const { currentUser } = useAuth();
  const commentsEndRef = useRef(null);

  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!post?._id) return;
      try {
        setLoading(true);
        const response = await api.getPostById(post._id);
        setComments(response.data.comments || []);
      } catch (error) {
        console.error("Failed to fetch comments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPostDetails();
  }, [post?._id]);

  useEffect(() => {
    if(!loading) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length, loading]);

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
    if (!currentUser || interactionLoading === commentId) return;

    setInteractionLoading(commentId);
    
    const comment = comments.find(c => c._id === commentId);
    if (!comment) return;

    try {
      let response;
      const isLiked = comment.likes.includes(currentUser.id);
      const isDisliked = comment.dislikes?.includes(currentUser.id);

      if (type === 'like') {
        response = isLiked 
          ? await api.unlikeComment(post._id, commentId) 
          : await api.likeComment(post._id, commentId);
      } else {
        response = isDisliked 
          ? await api.undislikeComment(post._id, commentId) 
          : await api.dislikeComment(post._id, commentId);
      }
      
      setComments(response.data);

    } catch (error) {
      console.error(`Failed to ${type} comment`, error);
      alert('Something went wrong. Please try again.');
    } finally {
      setInteractionLoading(null);
    }
  };

  if (!post) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="hidden md:block md:w-3/5 bg-black flex-shrink-0">
          <img
            src={`http://localhost:5000/${post.image}`}
            alt={post.caption}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="w-full md:w-2/5 flex flex-col">
          <div className="p-3 border-b flex items-center justify-between">
            <Link to={`/artist/${post.user.username}`} className="flex items-center font-semibold">
              <ProfileImage user={post.user} size="sm" />
              <span className="ml-2">{post.user.username}</span>
            </Link>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>

          <div className="flex-grow p-3 overflow-y-auto">
            {post.caption && (
              <>
                <p className="text-sm mb-3">{post.caption}</p>
                <hr className="mb-3"/>
              </>
            )}

            {loading ? (
              <div className="text-center text-gray-500">Loading comments...</div>
            ) : (
              <div className="space-y-4">
                {comments.map(comment => {
                  const isLiked = currentUser && comment.likes.includes(currentUser.id);
                  const isDisliked = currentUser && comment.dislikes?.includes(currentUser.id);

                  // ## 1. CALCULATE THE SCORE ##
                  // Get the total score by subtracting dislikes from likes.
                  const score = (comment.likes?.length || 0) - (comment.dislikes?.length || 0);

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
                              <button 
                                onClick={() => handleInteraction(comment._id, 'like')} 
                                className={`font-semibold ${isLiked ? 'text-blue-500' : 'hover:text-gray-600'}`}
                                disabled={interactionLoading === comment._id}
                              >
                                Like
                              </button>
                              <button 
                                onClick={() => handleInteraction(comment._id, 'dislike')} 
                                className={`font-semibold ${isDisliked ? 'text-red-500' : 'hover:text-gray-600'}`}
                                disabled={interactionLoading === comment._id}
                              >
                                Dislike
                              </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 pl-2 flex-shrink-0">
                          <div className={`flex items-center ${isLiked ? 'text-red-500' : isDisliked ? 'text-black' : 'text-gray-400'}`}>
                              <Heart size={12} className="mr-1" fill={isLiked || isDisliked ? 'currentColor' : 'none'} />
                              
                              {/* ## 2. DISPLAY THE SCORE ## */}
                              <span>{score}</span>
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