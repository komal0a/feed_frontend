import React, { useState, useRef } from 'react';
import { X, UploadCloud, MapPin, Video, Loader2 } from 'lucide-react';

interface UploadModalProps {
  onClose: () => void;
  onSuccess: (newReel: any) => void;
}

export default function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Form Data
  const [restaurant, setRestaurant] = useState('');
  const [dishName, setDishName] = useState('');
  const [price, setPrice] = useState('');
  
  // UI State
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection and create a local preview URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.includes('video')) {
        setError('Please select a valid video file (.mp4, .mov)');
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !restaurant || !dishName || !price) {
      setError('Please fill out all fields and select a video.');
      return;
    }

    setIsUploading(true);
    setError('');

    // 1. Get Location (Required by our backend)
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser.');
      setIsUploading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      // 2. Build the FormData payload
      const formData = new FormData();
      formData.append('video', file); // Matches upload.single('video') in Express
      formData.append('restaurant', restaurant);
      formData.append('dishName', dishName);
      formData.append('price', price);
      formData.append('lat', latitude.toString());
      formData.append('lng', longitude.toString());

      try {
        // 3. Send it to Express
        const res = await fetch('http://localhost:3000/reels', {
          method: 'POST',
          credentials: 'include',
          // Notice: NO headers object here! The browser handles the multipart boundary.
          body: formData
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to upload reel');

        // Cleanup and close
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        onSuccess(data.reel);
        onClose();

      } catch (err: any) {
        setError(err.message);
        setIsUploading(false);
      }
    }, () => {
      setError('Please allow location access to tag this food.');
      setIsUploading(false);
    });
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
      <div className="w-full h-[90vh] sm:h-auto sm:max-h-[90vh] sm:max-w-md bg-zinc-900 sm:rounded-3xl rounded-t-3xl flex flex-col relative overflow-hidden border border-zinc-800 shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="w-8" />
          <h2 className="text-white font-bold text-lg">Post a Craving</h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
          {error && (
            <div className="p-3 bg-red-500/20 text-red-400 text-sm rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Video Uploader Area */}
            <div 
              onClick={() => !previewUrl && fileInputRef.current?.click()}
              className={`w-full aspect-[9/16] max-h-[40vh] rounded-2xl border-2 border-dashed ${previewUrl ? 'border-emerald-500' : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50'} flex flex-col items-center justify-center overflow-hidden relative transition-colors cursor-pointer`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="video/*" 
                className="hidden" 
              />
              
              {previewUrl ? (
                <>
                  <video src={previewUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-4 right-4 bg-black/60 p-2 rounded-full text-white backdrop-blur-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center text-zinc-400 gap-2">
                  <UploadCloud className="w-8 h-8" />
                  <span className="text-sm font-medium">Select Video</span>
                </div>
              )}
            </div>

            {/* Input Fields */}
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Restaurant Name"
                value={restaurant}
                onChange={(e) => setRestaurant(e.target.value)}
                className="bg-zinc-800 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 placeholder-zinc-500"
                required
              />
              <input
                type="text"
                placeholder="Dish Name (e.g., Lava Cake)"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                className="bg-zinc-800 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 placeholder-zinc-500"
                required
              />
              <input
                type="text"
                placeholder="Price (e.g., ₹299)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-zinc-800 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 placeholder-zinc-500"
                required
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-800/50 p-3 rounded-xl">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
              <p>This video will be automatically tagged with your current location so nearby users can find it.</p>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isUploading || !file}
              className="w-full bg-emerald-500 disabled:bg-emerald-500/50 hover:bg-emerald-400 text-black font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading to Cloudinary...
                </>
              ) : (
                <>
                  <Video className="w-5 h-5" />
                  Post Video
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}