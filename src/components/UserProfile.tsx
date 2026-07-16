import { useState, useEffect } from 'react';
import { X, Grid, Heart, LogOut, Loader2 } from 'lucide-react';
import type { Reel } from "./ReelItem";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface UserProfileProps {
  userId: string;
  onClose: () => void;
  onLogout: () => void;
}
// export interface Reel {
//   id: string;
//   videoUrl: string;
//   restaurant: string;
//   dishName: string;
//   price: string;
//   creator: string;
//   likeCount: number;
//   commentCount: number;
//   lng?: number;
//   lat?: number;
// }

interface ProfileData {
  user: {
    username: string;
  };
  uploads: Reel[];
  likedReels: Reel[];
}
export default function UserProfile({ userId, onClose, onLogout }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'likes' | 'uploads'>('likes');

const [profileData, setProfileData] = useState<ProfileData | null>(null);  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/users/${userId}/profile`);
        const data = await res.json();
        setProfileData(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load profile", error);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId, API_URL]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
      onLogout();
      onClose();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 z-[100] bg-black flex items-center justify-center pointer-events-auto">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

const displayVideos =
  activeTab === "likes"
    ? profileData?.likedReels ?? []
    : profileData?.uploads ?? [];

  return (
    <div className="absolute inset-0 z-[100] bg-black text-white flex flex-col animate-in slide-in-from-right duration-300 pointer-events-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-900">
        <button onClick={onClose} className="p-2 -ml-2 text-zinc-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <span className="font-bold text-lg">@{profileData?.user.username}</span>
        <button onClick={handleLogout} className="p-2 -mr-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-8 py-8 border-b border-zinc-900">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{profileData?.uploads.length || 0}</span>
          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Posts</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{profileData?.likedReels.length || 0}</span>
          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Cravings</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-900">
        <button 
          onClick={() => setActiveTab('likes')}
          className={`flex-1 py-4 flex justify-center items-center gap-2 border-b-2 transition-colors ${activeTab === 'likes' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-zinc-500'}`}
        >
          <Heart className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setActiveTab('uploads')}
          className={`flex-1 py-4 flex justify-center items-center gap-2 border-b-2 transition-colors ${activeTab === 'uploads' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-zinc-500'}`}
        >
          <Grid className="w-5 h-5" />
        </button>
      </div>

      {/* Video Grid */}
      <div className="flex-1 overflow-y-auto bg-zinc-950">
        {displayVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-2 mt-20">
            {activeTab === 'likes' ? <Heart className="w-12 h-12" /> : <Grid className="w-12 h-12" />}
            <p>No videos yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {displayVideos.map((video: Reel) => (
              <div key={video._id || video.id} className="aspect-[9/16] bg-zinc-900 relative">
                <video src={video.videoUrl} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}