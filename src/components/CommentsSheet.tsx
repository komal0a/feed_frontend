import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';

interface Comment {
  _id: string;
  text: string;
  user: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

interface UserSummary {
  _id?: string;
  id?: string;
  username: string;
}

interface CommentsSheetProps {
  reelId: string;
  currentUser: UserSummary | null;
  onClose: () => void;
  onRequestAuth: () => void;
}

export default function CommentsSheet({ reelId, currentUser, onClose, onRequestAuth }: CommentsSheetProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch comments when the sheet opens
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:3000/reels/${reelId}/comments`);
        const data = await res.json();
        setComments(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch comments", error);
        setLoading(false);
      }
    };
    fetchComments();
  }, [reelId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return onRequestAuth();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:3000/reels/${reelId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for auth!
        body: JSON.stringify({ text: newComment })
      });

      if (!res.ok) throw new Error('Failed to post comment');
      
      const postedComment = await res.json();
      
      // Add the new comment to the top of the list instantly
      setComments([postedComment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center pointer-events-auto">
      {/* Background Dimmer */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose} 
      />
      
      {/* The Slide-Up Drawer */}
      <div className="relative w-full h-[65vh] bg-zinc-900 rounded-t-[2rem] flex flex-col animate-in slide-in-from-bottom-full duration-300 ease-out border-t border-zinc-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="w-8" /> {/* Spacer for centering */}
          <h2 className="text-white font-bold text-lg">Comments</h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comment List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-none">
          {loading ? (
            <div className="text-zinc-500 text-center mt-10 animate-pulse">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-zinc-500 text-center mt-10">Be the first to comment!</div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="flex flex-col gap-1">
                <span className="text-xs font-bold text-emerald-400">@{comment.user.username}</span>
                <p className="text-sm text-white">{comment.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800">
          {currentUser ? (
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-zinc-800 text-white px-4 py-3 rounded-full outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
              <button 
                type="submit" 
                disabled={isSubmitting || !newComment.trim()}
                className="p-3 bg-emerald-500 text-black rounded-full disabled:opacity-50 transition-opacity"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button 
              onClick={onRequestAuth}
              className="w-full bg-zinc-800 text-white font-medium py-3 rounded-full text-sm"
            >
              Log in to comment
            </button>
          )}
        </div>

      </div>
    </div>
  );
}