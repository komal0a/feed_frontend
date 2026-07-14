import { useState } from "react";
import { Map, Marker, Popup, NavigationControl } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { X } from "lucide-react";
import type { Reel } from "./ReelItem";

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
    <div className="absolute inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10">
        <h2 className="text-white font-bold text-xl">Nearby Cravings</h2>

        <button
          onClick={onClose}
          className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Map */}
      <div className="flex-1">
        <Map
          initialViewState={{
            latitude: userLat,
            longitude: userLng,
            zoom: 14,
            pitch: 45,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="https://tiles.openfreemap.org/styles/liberty"
        >
          <NavigationControl position="bottom-right" />

          {/* User Location */}
          <Marker latitude={userLat} longitude={userLng}>
            <div className="w-6 h-6 bg-blue-500 border-4 border-white rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          </Marker>

          {/* Restaurant Markers */}
          {reels.map((reel) => {
            if (reel.lat == null || reel.lng == null) return null;

            return (
              <Marker
                key={reel.id}
                latitude={reel.lat}
                longitude={reel.lng}
              >
                <button
                  className="text-3xl hover:scale-125 transition drop-shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedReel(reel);
                  }}
                >
                  🍔
                </button>
              </Marker>
            );
          })}

          {/* Popup */}
          {selectedReel && (
            <Popup
              latitude={selectedReel.lat!}
              longitude={selectedReel.lng!}
              closeOnClick={false}
              onClose={() => setSelectedReel(null)}
              anchor="top"
            >
              <div className="p-3 bg-zinc-900 text-white w-48 rounded-xl border border-zinc-800 shadow-2xl">
                <h3 className="font-bold text-sm truncate">
                  {selectedReel.restaurant}
                </h3>

                <p className="text-xs text-zinc-400 truncate mb-2">
                  {selectedReel.dishName}
                </p>

                <p className="font-bold text-emerald-400 mb-2">
                  {selectedReel.price}
                </p>

                <button
                  onClick={() => {
                    alert("Routing back to feed...");
                    onClose();
                  }}
                  className="w-full bg-emerald-500 text-black text-xs font-bold py-2 rounded-lg"
                >
                  Grab This
                </button>
              </div>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
}