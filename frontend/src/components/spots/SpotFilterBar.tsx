'use client';

import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Volume2,
  Wifi,
  Plug,
  DollarSign,
  Layers,
  X,
  MapPin,
  Compass,
  Navigation,
  Loader2,
  Globe2,
} from 'lucide-react';
import {
  NoiseLevel,
  OutletDensity,
  PriceLevel,
  SpotCategory,
  WifiSpeed,
} from '../../types';
import { SpotsQueryParams } from '../../services/api';

interface Props {
  filters: SpotsQueryParams;
  onFilterChange: (newFilters: Partial<SpotsQueryParams>) => void;
  onReset: () => void;
}

export const SpotFilterBar: React.FC<Props> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const countries = [
    { label: '🌍 All Locations', value: undefined },
    { label: '🇮🇳 India', value: 'India', cities: ['Bengaluru', 'Mumbai', 'New Delhi', 'Hyderabad'] },
    { label: '🇯🇵 Japan', value: 'Japan', cities: ['Tokyo', 'Kyoto'] },
    { label: '🇹🇭 Thailand', value: 'Thailand', cities: ['Bangkok', 'Chiang Mai'] },
    { label: '🇸🇬 Singapore', value: 'Singapore', cities: ['Singapore'] },
    { label: '🇬🇧 United Kingdom', value: 'United Kingdom', cities: ['London'] },
    { label: '🇺🇸 United States', value: 'United States', cities: ['New York', 'San Francisco'] },
  ];

  const categories: { label: string; value?: SpotCategory }[] = [
    { label: 'All Categories', value: undefined },
    { label: 'Libraries 🏛️', value: 'library' },
    { label: 'Artisan Cafes ☕', value: 'cafe' },
    { label: 'Coworking Hubs 💻', value: 'coworking' },
    { label: 'University Commons 🎓', value: 'university_campus' },
    { label: 'Bookshop Cafes 📖', value: 'bookshop_cafe' },
    { label: 'Outdoor / Atriums 🌿', value: 'park_outdoor' },
  ];

  const noiseLevels: { label: string; value?: NoiseLevel }[] = [
    { label: 'Any Noise Level', value: undefined },
    { label: '🤫 Silent Focus', value: 'silent' },
    { label: '🎧 Whisper Quiet', value: 'quiet' },
    { label: '☕ Moderate Chatter', value: 'moderate' },
    { label: '⚡ Energetic Buzz', value: 'buzzing' },
  ];

  const wifiSpeeds: { label: string; value?: WifiSpeed }[] = [
    { label: 'Any WiFi Speed', value: undefined },
    { label: '🚀 Ultra Fiber (>100M)', value: 'ultra_fast' },
    { label: '⚡ Fast (30-100M)', value: 'fast' },
    { label: '📶 Decent (10-30M)', value: 'decent' },
  ];

  const outletOptions: { label: string; value?: OutletDensity }[] = [
    { label: 'Any Power Outlets', value: undefined },
    { label: '🔌 Outlets at Every Desk', value: 'abundant' },
    { label: '⚡ Near Walls / Booths', value: 'moderate' },
  ];

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        onFilterChange({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          radiusKm: 150,
          country: undefined,
          city: undefined,
          page: 1,
        });
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation failed:', err.message);
        setGeoError('Unable to retrieve location. Please select your country or city below.');
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const selectedCountryObj = countries.find((c) => c.value === filters.country);

  const hasActiveFilters =
    !!filters.query ||
    !!filters.country ||
    !!filters.city ||
    !!filters.lat ||
    !!filters.category ||
    !!filters.noiseLevel ||
    !!filters.wifiSpeed ||
    !!filters.outletDensity ||
    !!filters.priceLevel;

  return (
    <div className="flex flex-col gap-4 bg-surface-card border border-surface-border p-4 rounded-2xl shadow-xl">
      {/* Country and Geolocation Selector Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-3 border-b border-surface-border/60">
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 scrollbar-none">
          <button
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              filters.lat !== undefined
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-glow'
                : 'bg-surface text-emerald-400 hover:text-white hover:bg-emerald-950/40 border-emerald-500/30'
            }`}
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            <span>{filters.lat ? '📍 Near My Location (Active)' : '📍 Detect Near Me'}</span>
          </button>

          {countries.map((c) => {
            const isSelected = filters.country === c.value && filters.lat === undefined;
            return (
              <button
                key={c.label}
                onClick={() =>
                  onFilterChange({
                    country: c.value,
                    city: undefined,
                    lat: undefined,
                    lng: undefined,
                    page: 1,
                  })
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border transition-all ${
                  isSelected
                    ? 'bg-primary-600 text-white border-primary-400 shadow-glow'
                    : 'bg-surface text-slate-300 hover:text-white border-surface-border hover:border-slate-600'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {geoError && (
          <span className="text-[11px] text-amber-400 self-start sm:self-auto font-medium">
            {geoError}
          </span>
        )}
      </div>

      {/* City Sub-Pills (if a country is selected) */}
      {selectedCountryObj && selectedCountryObj.cities && selectedCountryObj.cities.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-400 font-medium whitespace-nowrap mr-1">Cities:</span>
          <button
            onClick={() => onFilterChange({ city: undefined, page: 1 })}
            className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
              !filters.city
                ? 'bg-slate-700 text-white font-semibold'
                : 'bg-surface text-slate-400 hover:text-white'
            }`}
          >
            All {selectedCountryObj.value}
          </button>
          {selectedCountryObj.cities.map((city) => (
            <button
              key={city}
              onClick={() => onFilterChange({ city, page: 1 })}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                filters.city === city
                  ? 'bg-primary-600 text-white font-semibold shadow-sm'
                  : 'bg-surface text-slate-400 hover:text-white border border-surface-border'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      )}

      {/* Search Input and Sort Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by city, neighborhood, spot name, or vibes (e.g. 'Bengaluru', 'Tokyo', 'Bangkok', 'fast wifi')..."
            value={filters.query || ''}
            onChange={(e) => onFilterChange({ query: e.target.value, page: 1 })}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-surface-border text-sm text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
          />
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filters.sortBy || 'popularity'}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any, page: 1 })}
            className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-surface border border-surface-border text-xs text-slate-200 focus:outline-none focus:border-primary-500"
          >
            <option value="popularity">🔥 Most Popular</option>
            <option value="rating">⭐ Highest Rated</option>
            <option value="newest">✨ Newly Added</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 py-2.5 px-3 rounded-xl bg-surface hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-surface-border text-xs transition-colors whitespace-nowrap"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = filters.category === cat.value;
          return (
            <button
              key={cat.label}
              onClick={() => onFilterChange({ category: cat.value, page: 1 })}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border transition-all ${
                isSelected
                  ? 'bg-primary-600 text-white border-primary-400 shadow-glow'
                  : 'bg-surface text-slate-300 hover:text-white border-surface-border hover:border-slate-600'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Detailed Filters (Noise, WiFi, Outlets) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-surface-border/60">
        {/* Noise Filter */}
        <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-xl border border-surface-border">
          <Volume2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <select
            value={filters.noiseLevel || ''}
            onChange={(e) =>
              onFilterChange({
                noiseLevel: (e.target.value as NoiseLevel) || undefined,
                page: 1,
              })
            }
            className="w-full bg-transparent text-xs text-slate-200 focus:outline-none"
          >
            {noiseLevels.map((n) => (
              <option key={n.label} value={n.value || ''} className="bg-surface text-white">
                {n.label}
              </option>
            ))}
          </select>
        </div>

        {/* WiFi Speed Filter */}
        <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-xl border border-surface-border">
          <Wifi className="w-4 h-4 text-teal-400 flex-shrink-0" />
          <select
            value={filters.wifiSpeed || ''}
            onChange={(e) =>
              onFilterChange({
                wifiSpeed: (e.target.value as WifiSpeed) || undefined,
                page: 1,
              })
            }
            className="w-full bg-transparent text-xs text-slate-200 focus:outline-none"
          >
            {wifiSpeeds.map((w) => (
              <option key={w.label} value={w.value || ''} className="bg-surface text-white">
                {w.label}
              </option>
            ))}
          </select>
        </div>

        {/* Power Outlets Filter */}
        <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-xl border border-surface-border">
          <Plug className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <select
            value={filters.outletDensity || ''}
            onChange={(e) =>
              onFilterChange({
                outletDensity: (e.target.value as OutletDensity) || undefined,
                page: 1,
              })
            }
            className="w-full bg-transparent text-xs text-slate-200 focus:outline-none"
          >
            {outletOptions.map((o) => (
              <option key={o.label} value={o.value || ''} className="bg-surface text-white">
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
