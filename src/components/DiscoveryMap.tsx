import { useState } from "react";
import { X } from "lucide-react";
import {type Reel } from "./ReelItem";

// NOTE: Uncomment this line in your local VS Code environment!
// import "maplibre-gl/dist/maplibre-gl.css";

interface DiscoveryMapProps {
  reels: Reel[];
  userLat: number;
  userLng: number;
  onClose: () => void;
}

export default function DiscoveryMap({
  reels,
  userLat,
  userLng,
  onClose,
}: DiscoveryMapProps) {
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);

  return (
    <div className="absolute inset-0 z-50 bg-zinc-950 flex flex-col animate-in fade-in duration-300 overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-5 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <h2 className="text-xl font-bold text-white drop-shadow-md">
          Nearby Cravings
        </h2>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* 
        This is a stylized CSS placeholder for the preview environment. 
        In your local code, replace this entire <div className="relative flex-1"> 
        block with the <Map> component from @vis.gl/react-maplibre.
      */}
      <div className="relative flex-1 bg-[#1a1c23] overflow-hidden">
        {/* Decorative Grid Background to simulate a map surface */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(#3f3f46 1px, transparent 1px), linear-gradient(90deg, #3f3f46 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Fake Map Features */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-zinc-800/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-32 bg-emerald-900/20 rounded-full blur-2xl transform rotate-45" />

        {/* Center Content / User Location */}
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="relative flex items-center justify-center">
             <div className="absolute w-24 h-24 bg-blue-500/20 rounded-full animate-ping" />
             <div className="w-6 h-6 bg-blue-500 border-4 border-white rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10" />
           </div>
        </div>

        {/* Mock Pins (Scattered around center) */}
        {reels.slice(0, 5).map((reel, index) => {
          // Generate deterministic fake offsets for the preview
          const angle = (index / reels.length) * Math.PI * 2;
          const radius = 100 + (index * 20); // Spaced out
          const top = `calc(50% + ${Math.sin(angle) * radius}px)`;
          const left = `calc(50% + ${Math.cos(angle) * radius}px)`;

          return (
             <div 
                key={reel.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                style={{ top, left }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedReel(reel);
                }}
             >
                <div className="flex flex-col items-center transform group-hover:scale-110 transition-transform">
                  <div className="bg-emerald-500 text-black text-xs font-bold px-2 py-1 rounded-full mb-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {reel.price || '₹299'}
                  </div>
                  <div className="text-3xl filter drop-shadow-md">
                    🍔
                  </div>
                </div>
             </div>
          )
        })}

        {/* Mock Popup */}
        {selectedReel && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full -mt-4 z-30">
            <div className="w-56 p-3 bg-zinc-900 text-white rounded-xl border border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-200">
               <button 
                 onClick={() => setSelectedReel(null)}
                 className="absolute top-2 right-2 text-zinc-500 hover:text-white"
               >
                 <X className="w-4 h-4" />
               </button>
               <h3 className="font-bold text-sm truncate pr-6 text-emerald-400">
                 {selectedReel.restaurant || 'Sample Restaurant'}
               </h3>
               <p className="text-xs text-zinc-400 truncate mb-3">
                 {selectedReel.dishName || 'Delicious Food'}
               </p>
               <button className="w-full bg-emerald-500 text-black text-xs font-bold py-2 rounded-lg hover:bg-emerald-400 transition-colors">
                 View Details
               </button>
               {/* Triangle pointer */}
               <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-zinc-900 border-r border-b border-zinc-800 rotate-45" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}