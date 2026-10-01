'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Spot } from '../../types';
import { NoiseBadge } from '../ui/NoiseBadge';
import { WifiSpeedMeter } from '../ui/WifiSpeedMeter';
import { OutletBadge } from '../ui/OutletBadge';
import { useAuth } from '../../context/AuthContext';
import { spotsApi } from '../../services/api';
import {
  Star,
  Bookmark,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

interface Props {
  spot: Spot;
  onBookmarkChange?: (isSaved: boolean) => void;
}

export const SpotCard: React.FC<Props> = ({ spot, onBookmarkChange }) => {
  const { isAuthenticated, requireAuth, savedSpotIds, setSavedSpotIds } = useAuth();
  const isSaved = savedSpotIds.includes(spot._id);
  const [isSaving, setIsSaving] = useState(false);

  const performSave = async () => {
    try {
      setIsSaving(true);
      const res = await spotsApi.toggleSave(spot._id);
      setSavedSpotIds(res.savedSpotIds);
      if (onBookmarkChange) {
        onBookmarkChange(res.isSaved);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    requireAuth(
      () => performSave(),
      'Sign in to save your favourite study spots.',
    );
  };

  const defaultPhoto =
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80';
  const photoUrl = spot.photos && spot.photos.length > 0 ? spot.photos[0] : defaultPhoto;

  return (
    <div className="group flex flex-col bg-surface-card border border-surface-border hover:border-primary-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-glow transition-all duration-300">
      {/* Photo Banner with Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-surface">
        <img
          src={photoUrl}
          alt={spot.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-surface/90 backdrop-blur-md text-slate-200 border border-surface-border">
            {spot.category.replace('_', ' ')}
          </span>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={handleBookmarkToggle}
          disabled={isSaving}
          title={isSaved ? 'Remove from saved' : 'Save spot'}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md border transition-all ${
            isSaved
              ? 'bg-primary-600 text-white border-primary-400 shadow-glow'
              : 'bg-surface/80 text-slate-300 hover:text-white hover:bg-surface border-surface-border'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Bottom Spot Rating & Check-ins */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
          <div className="flex items-center gap-1.5 bg-surface-card/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-surface-border">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-bold text-white">{spot.rating.toFixed(1)}</span>
            <span className="text-slate-400">({spot.reviewCount})</span>
          </div>

          <div className="flex items-center gap-1 bg-surface-card/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-surface-border text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{spot.checkInCount} check-ins</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div>
          <Link href={`/spots/${spot._id}`} className="block group/link">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-bold text-white group-hover/link:text-primary-300 transition-colors line-clamp-1">
                {spot.name}
              </h3>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover/link:text-primary-300 flex-shrink-0" />
            </div>
          </Link>

          <p className="flex items-center gap-1 text-xs text-slate-400 mt-1 mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span className="truncate">{spot.address}</span>
          </p>

          {/* Key Study Metrics: Noise, WiFi, Outlets */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <NoiseBadge level={spot.noiseLevel} size="sm" />
            <WifiSpeedMeter speed={spot.wifiSpeed} mbps={spot.wifiSpeedMbps} size="sm" />
            <OutletBadge density={spot.outletDensity} size="sm" />
          </div>

          {/* AI Best For Description */}
          {spot.bestFor && (
            <p className="text-xs text-slate-300 line-clamp-2 bg-surface/60 p-2.5 rounded-xl border border-surface-border/60">
              <span className="text-primary-400 font-semibold flex items-center gap-1 mb-0.5">
                <Sparkles className="w-3 h-3 text-primary-400" /> Ideal For:
              </span>
              {spot.bestFor}
            </p>
          )}
        </div>

        {/* View Details Link */}
        <div className="pt-2 border-t border-surface-border flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">{spot.city}</span>
          <Link
            href={`/spots/${spot._id}`}
            className="text-primary-400 font-semibold hover:text-primary-300 transition-colors flex items-center gap-1"
          >
            Explore Spot Details →
          </Link>
        </div>
      </div>
    </div>
  );
};
