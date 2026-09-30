'use client';

import React, { useState } from 'react';
import { Spot } from '../../types';
import { MapPin, Navigation, Compass, Layers, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Props {
  spots: Spot[];
  selectedSpotId?: string;
  onSelectSpot?: (spot: Spot) => void;
}

export const SpotMapMock: React.FC<Props> = ({
  spots,
  selectedSpotId,
  onSelectSpot,
}) => {
  const [activeSpot, setActiveSpot] = useState<Spot | null>(
    spots.find((s) => s._id === selectedSpotId) || spots[0] || null,
  );

  const handleSpotClick = (spot: Spot) => {
    setActiveSpot(spot);
    if (onSelectSpot) onSelectSpot(spot);
  };

  return (
    <div className="relative w-full h-full min-h-[450px] bg-slate-950 rounded-2xl border border-surface-border overflow-hidden flex flex-col justify-between p-4 shadow-2xl">
      {/* Visual Map Grid & Radial Gradient */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#6366f1 1px, transparent 1px), radial-gradient(#10b981 1px, #090d16 1px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
        }}
      />

      {/* Map Control Overlay Header */}
      <div className="relative z-10 flex items-center justify-between bg-surface/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-surface-border">
        <div className="flex items-center gap-2 text-xs font-semibold text-white">
          <Compass className="w-4 h-4 text-primary-400" />
          <span>Interactive Study Map</span>
          <span className="text-slate-400 font-normal">({spots.length} spots rendered)</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-700/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Live Acoustic Density Active</span>
        </div>
      </div>

      {/* Map Spot Interactive Pins */}
      <div className="relative z-10 my-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
        {spots.slice(0, 8).map((spot, idx) => {
          const isSelected = activeSpot?._id === spot._id;
          return (
            <button
              key={spot._id}
              onClick={() => handleSpotClick(spot)}
              className={`relative flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-300 ${
                isSelected
                  ? 'bg-primary-600/30 border-primary-400 shadow-glow scale-105'
                  : 'bg-surface/80 hover:bg-surface border-surface-border hover:border-slate-500'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs mb-1.5 shadow-md ${
                  spot.noiseLevel === 'silent'
                    ? 'bg-indigo-600'
                    : spot.noiseLevel === 'quiet'
                    ? 'bg-emerald-600'
                    : 'bg-amber-600'
                }`}
              >
                <MapPin className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white line-clamp-1">{spot.name}</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{spot.rating.toFixed(1)}</span>
                <span>•</span>
                <span>{spot.wifiSpeedMbps}M</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Floating Active Spot Card */}
      {activeSpot && (
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-card/95 backdrop-blur-md p-4 rounded-xl border border-surface-border shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-surface border border-surface-border overflow-hidden flex-shrink-0">
              <img
                src={activeSpot.photos?.[0] || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=400&q=80'}
                alt={activeSpot.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{activeSpot.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface text-slate-300 border border-surface-border uppercase">
                  {activeSpot.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-sm mt-0.5">
                {activeSpot.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href={`/spots/${activeSpot._id}`}
              className="w-full sm:w-auto text-center px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium text-xs shadow-glow transition-all"
            >
              View Complete Spot Profile →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
