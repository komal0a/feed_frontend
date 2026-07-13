import React, { useRef, useEffect, useState } from 'react';
import { Heart, ShoppingBag, MessageCircle, MapPin } from 'lucide-react';
import CommentsSheet from './CommentsSheet';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './PaymentForm';

// Initialize Stripe (Must be outside component to avoid re-renders)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

// --- TYPES ---
export interface User {
id: string;
username: string;
email: string;
}

export interface Reel {
id: string;
videoUrl: string;
restaurant: string;
dishName: string;
price: string;
creator: string;
likeCount: number;
commentCount: number;
lng?: number;
lat?: number;
}

interface ReelItemProps {
reel: Reel;
currentUser: User | null;
setShowAuth: (show: boolean) => void;
}

export default function ReelItem({ reel, currentUser, setShowAuth }: ReelItemProps) {
const videoRef = useRef<HTMLVideoElement>(null);
const [isPlaying, setIsPlaying] = useState(false);
const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
const [isCommentsOpen, setIsCommentsOpen] = useState(false);

// Stripe State
const [clientSecret, setClientSecret] = useState<string | null>(null);
const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'form' | 'success'>('idle');

// Engagement State
const [isLiked, setIsLiked] = useState(false);
const [likeCount, setLikeCount] = useState(reel.likeCount || 0);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Handle auto-play and pause when scrolling
useEffect(() => {
const observer = new IntersectionObserver(
([entry]) => {
if (entry.isIntersecting) {
videoRef.current?.play().catch(() => {});
setIsPlaying(true);
} else {
videoRef.current?.pause();
setIsPlaying(false);
setIsCheckoutOpen(false); // Close drawer if they scroll away
setPaymentStatus('idle'); // Reset payment state
setIsCommentsOpen(false);
}
},
{ threshold: 0.6 }
);

if (videoRef.current) observer.observe(videoRef.current);
return () => observer.disconnect();


}, []);

const handleLike = async () => {
if (!currentUser) {
setShowAuth(true);
return;
}

// Optimistic UI update
const previousLiked = isLiked;
const previousCount = likeCount;
setIsLiked(!isLiked);
setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

try {
  const response = await fetch(`${API_URL}/reels/${reel.id}/like`, {
    method: 'POST',
    credentials: 'include' // Must send JWT cookie!
  });

  if (!response.ok) throw new Error('Failed to toggle like');
  
  const data = await response.json();
  setIsLiked(data.isLiked); // Sync with absolute truth from backend
} catch (error) {
  console.error(error);
  // Revert if API fails
  setIsLiked(previousLiked);
  setLikeCount(previousCount);
}


};

const handleProceedToPayment = async () => {
if (!currentUser) {
setShowAuth(true);
return;
}

setPaymentStatus('loading');
try {
  // Fetch the clientSecret from your backend /checkout route
  const res = await fetch(`${API_URL}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ reelId: reel.id, price: reel.price }) 
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);

  setClientSecret(data.clientSecret);
  setPaymentStatus('form');
} catch (error) {
  console.error(error);
  setPaymentStatus('idle');
  alert('Failed to initialize checkout. Is the backend running?');
}


};

return (
  <div className="h-screen w-full snap-start relative flex items-center justify-center bg-black overflow-hidden">

    {/* 1. The Video */}
    <video
      ref={videoRef}
      src={reel.videoUrl}
      loop
      playsInline
      muted
      className="h-full w-full object-cover cursor-pointer"
      onClick={() => {
        if (isPlaying) videoRef.current?.pause();
        else videoRef.current?.play();
        setIsPlaying(!isPlaying);
      }}
    />

    {/* 2. Social Interaction Bar */}
    <div className="absolute right-4 bottom-32 flex flex-col gap-6 text-white items-center z-10">

      <button
        onClick={handleLike}
        className="p-3 bg-black/40 rounded-full backdrop-blur-md active:scale-90 transition-transform flex flex-col items-center gap-1"
      >
        <Heart
          className={`w-6 h-6 transition-colors ${
            isLiked
              ? "fill-red-500 text-red-500"
              : "text-white"
          }`}
        />
        <span className="text-xs font-semibold">
          {likeCount}
        </span>
      </button>

      <button
        onClick={() => setIsCommentsOpen(true)}
        className="p-3 bg-black/40 rounded-full backdrop-blur-md active:scale-90 transition-transform flex flex-col items-center gap-1"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <span className="text-xs font-semibold">
          {reel.commentCount || 0}
        </span>
      </button>

    </div>

    {/* 3. Bottom Overlay */}
    <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white flex flex-col gap-4 z-10 pointer-events-none">

      <div className="pointer-events-auto">
        <p className="text-sm text-emerald-400 font-bold mb-1">
          @{reel.creator}
        </p>

        <h3 className="font-bold text-2xl tracking-tight">
          {reel.restaurant}
        </h3>

        <p className="text-sm text-zinc-300 font-medium">
          {reel.dishName}
        </p>
      </div>

      <button
        onClick={() => setIsCheckoutOpen(true)}
        className="pointer-events-auto w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-2xl"
      >
        <ShoppingBag className="w-5 h-5" />
        Grab This • {reel.price}
      </button>

    </div>

    {/* 4. Checkout Drawer */}
    {isCheckoutOpen && (
      // <-- Paste your entire checkout drawer here exactly as you already have it.
      <div className="absolute inset-0 z-50 flex items-end justify-center pointer-events-auto">

    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={() => {
        setIsCheckoutOpen(false);
        setPaymentStatus("idle");
      }}
    />

    <div className="relative w-full bg-zinc-900 rounded-t-[2rem] p-6 pb-10 text-white">
      ...
    </div>

  </div>
  )}

    {/* 5. Comments */}
    {isCommentsOpen && (
      <CommentsSheet
        reelId={reel.id}
        currentUser={currentUser}
        onClose={() => setIsCommentsOpen(false)}
        onRequestAuth={() => {
          setIsCommentsOpen(false);
          setShowAuth(true);
        }}
      />
    )}

  </div>
);
}