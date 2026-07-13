import { useEffect, useState } from 'react';
import { MapPin, Plus, User as UserIcon, Map as MapIcon } from 'lucide-react';
import AuthModal from './AuthModal';
import UploadModal from './UploadModal';
import UserProfile from './UserProfile';
import DiscoveryMap from './DiscoveryMap';
import ReelItem, { type Reel, type User } from './ReelItem';

// --- MAIN FEED COMPONENT ---
export default function ReelFeed() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  
  // Auth State
  const [showAuth, setShowAuth] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // 1. Grab user location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // 2. Fetch hyper-local food from live Express backend
          try {
            const response = await fetch(`http://localhost:3000/api/feed?lat=${latitude}&lng=${longitude}`, {
              credentials: 'include' // Ensures cookies are sent if user is logged in
            });
            const data = await response.json();
            
            if (response.ok) {
              setReels(data);
            }
            setLoading(false);
          } catch (error) {
            console.error("Backend is asleep or unreachable", error);
            setLoading(false); 
          }
        },
        (error) => {
          console.error("User denied location", error);
          setLocationError(true);
          setLoading(false);
        }
      );
    } else {
      setLocationError(true);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center font-medium animate-pulse">
        Locating nearby cravings...
      </div>
    );
  }
  
  if (locationError) {
    return (
      <div className="h-screen w-full bg-black text-white flex flex-col items-center justify-center gap-4 p-6 text-center">
        <MapPin className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold">Location Required</h2>
        <p className="text-zinc-400">We need your location to show food that can actually reach you.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-none relative">
      {reels.length === 0 ? (
        <div className="h-full flex items-center justify-center text-zinc-500">No reels found in your area.</div>
      ) : (
        reels.map((reel) => (
          <ReelItem 
            key={reel.id} 
            reel={reel} 
            currentUser={currentUser} 
            setShowAuth={setShowAuth} 
          />
        ))
      )}

      {/* Global Auth Modal */}
      {showAuth && (
        <AuthModal 
          onClose={() => setShowAuth(false)} 
          onSuccess={(user) => {
            setCurrentUser(user);
          }} 
        />
      )}

      {/* Global Upload Modal */}
      {showUpload && (
        <UploadModal 
          onClose={() => setShowUpload(false)} 
          onSuccess={(newReel) => {
            setReels([{ ...newReel, creator: currentUser?.username || 'you' }, ...reels]);
          }} 
        />
      )}

      {/* Top Right Navigation Icons */}
      <div className="absolute top-6 right-6 z-40 flex flex-col gap-4">
        <button 
          onClick={() => setShowMap(true)}
          className="p-3 bg-black/40 border border-zinc-800 rounded-full text-white backdrop-blur-md hover:bg-black/60 transition-colors shadow-lg"
        >
          <MapIcon className="w-6 h-6" />
        </button>

        <button 
          onClick={() => currentUser ? setShowProfile(true) : setShowAuth(true)}
          className="p-3 bg-black/40 border border-zinc-800 rounded-full text-white backdrop-blur-md hover:bg-black/60 transition-colors shadow-lg"
        >
          <UserIcon className="w-6 h-6" />
        </button>
        
        <button 
          onClick={() => currentUser ? setShowUpload(true) : setShowAuth(true)}
          className="p-3 bg-black/40 border border-zinc-800 rounded-full text-white backdrop-blur-md hover:bg-black/60 transition-colors shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {showProfile && currentUser && (
        <UserProfile 
          userId={currentUser.id} 
          onClose={() => setShowProfile(false)} 
          onLogout={() => {
            setCurrentUser(null);
            setShowProfile(false);
          }}
        />
      )}

      {showMap && userLocation && (
        <DiscoveryMap 
          reels={reels} 
          userLat={userLocation.lat} 
          userLng={userLocation.lng} 
          onClose={() => setShowMap(false)} 
        />
      )}
    </div>
  );
}