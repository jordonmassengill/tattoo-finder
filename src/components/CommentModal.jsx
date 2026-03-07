import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Send, Trash2, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProfileImage from './ProfileImage';

const profileUrl = (user) => {
  if (!user?.username) return '/';
  return user.userType === 'shop' ? `/shop/${user.username}` : `/artist/${user.username}`;
};

const CommentModal = ({ post, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interactionLoading, setInteractionLoading] = useState(null);
  const { currentUser } = useAuth();
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!post?._id) return;
      try {
        setLoading(true);
        const response = await api.getPostById(post._id);
        setComments(response.data.comments || []);
      } catch (error) {
        console.error("Error fetching post details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPostDetails();
  }, [post?._id, onClose]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const trimmedComment = newComment.trim();
    if (!trimmedComment || isSubmitting) return;

    setIsSubmitting(true);

    const optimisticComment = {
      _id: `temp-${Date.now()}`,
      user: currentUser,
      text: trimmedComment,
      date: new Date().toISOString(),
      likes: [],
      dislikes: [],
    };

    setComments(prevComments => [optimisticComment, ...prevComments]);
    setNewComment('');

    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);

    try {
      const response = await api.addComment(post._id, trimmedComment);
      setComments(response.data);
    } catch (error) {
      console.error("Failed to post comment:", error);
      alert("Could not post your comment. Please try again.");
      setComments(prev => prev.filter(c => c._id !== optimisticComment._id));
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
    if (!comment) {
        setInteractionLoading(null);
        return;
    }

    try {
      const isLiked = comment.likes.includes(currentUser.id);
      const isDisliked = comment.dislikes?.includes(currentUser.id);
      let response;

      if (type === 'like') {
        response = isLiked 
          ? await api.unlikeComment(post._id, commentId) 
          : await api.likeComment(post._id, commentId);
      } else {
        response = isDisliked 
          ? await api.undislikeComment(post._id, commentId) 
          : await api.dislikeComment(post._id, commentId);
      }
      
      const updatedCommentsFromServer = response.data;

      setComments(prevComments => {
        const updatedDataMap = new Map(updatedCommentsFromServer.map(c => [c._id, c]));
        return prevComments.map(existingComment => 
            updatedDataMap.get(existingComment._id) || existingComment
        );
      });

    } catch (error) {
      console.error(`Failed to ${type} comment:`, error);
      alert('Something went wrong with your request. Please try again.');
    } finally {
      setInteractionLoading(null);
    }
  };

  if (!post) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-5xl h-full max-h-[80vh] flex overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="hidden md:block md:w-3/5 bg-black flex-shrink-0">
          <img
            src={`http://localhost:5000/${post.image}`}
            alt={post.caption}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="w-full md:w-2/5 flex flex-col">
          <header className="p-3 border-b dark:border-zinc-800 flex items-center justify-between">
            <Link to={profileUrl(post.user)} className="flex items-center font-semibold dark:text-gray-100">
              <ProfileImage user={post.user} size="sm" />
              <span className="ml-2">{post.user.username}</span>
            </Link>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-gray-300">
              <X size={20} />
            </button>
          </header>

          <main ref={scrollContainerRef} className="flex-grow p-3 overflow-y-auto">
            {post.caption && (
              <p className="text-sm mb-2 dark:text-gray-200">{post.caption}</p>
            )}

            {(post.styles?.length > 0 || post.tags?.length > 0) && (
              <div className="mb-3">
                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs text-blue-500">#{tag}</span>
                    ))}
                  </div>
                )}
                {post.styles?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.styles.map(style => (
                      <span key={style} className="text-xs bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-full px-2 py-0.5">{style}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(post.caption || post.styles?.length > 0 || post.tags?.length > 0) && (
              <hr className="mb-3 dark:border-zinc-700"/>
            )}

            {loading ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4">Loading comments...</div>
            ) : (
              <div className="space-y-4">
                {comments.map(comment => {
                  const isLiked = currentUser && comment.likes.includes(currentUser.id);
                  const isDisliked = currentUser && comment.dislikes?.includes(currentUser.id);
                  const score = (comment.likes?.length || 0) - (comment.dislikes?.length || 0);

                  return (
                    <div key={comment._id} className="flex items-start group relative w-full justify-between">
                      <div className="flex items-start flex-grow min-w-0">
                        <ProfileImage user={comment.user} size="sm" />
                        <div className="ml-3 text-sm flex-grow min-w-0">
                          <p className="break-words dark:text-gray-200">
                            <Link to={profileUrl(comment.user)} className="font-semibold dark:text-gray-100">{comment.user.username || 'User'}</Link>
                            <span className="ml-1">{comment.text}</span>
                          </p>
                          <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 mt-1 space-x-3">
                              <time dateTime={comment.date}>{new Date(comment.date).toLocaleDateString()}</time>
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
                          <div className={`flex items-center text-sm ${isLiked ? 'text-red-500' : isDisliked ? 'text-black dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                              <Heart size={12} className="mr-1" fill={isLiked || isDisliked ? 'currentColor' : 'none'} />
                              <span>{score}</span>
                          </div>
                          {currentUser?.id === comment.user?._id && (
                            <button onClick={() => handleDeleteComment(comment._id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete comment">
                              <Trash2 size={14} />
                            </button>
                          )}
                      </div>
                    </div>
                  );
                })}
                {comments.length === 0 && !loading && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No comments yet. Be the first!</p>
                )}
              </div>
            )}
          </main>

          <footer className="p-3 border-t dark:border-zinc-800">
            <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
              <ProfileImage user={currentUser} size="sm" />
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-grow border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-200 dark:placeholder-gray-400"
                disabled={isSubmitting}
                aria-label="Add a comment"
              />
              <button
                type="submit"
                className="text-blue-500 font-semibold disabled:text-blue-300"
                disabled={!newComment.trim() || isSubmitting}
                aria-label="Post comment"
              >
                <Send size={24} />
              </button>
            </form>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;