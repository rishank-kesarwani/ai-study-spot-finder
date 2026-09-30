'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { spotsApi, SpotsQueryParams } from '../../services/api';
import { Spot, PaginatedResult } from '../../types';
import { SpotCard } from '../../components/spots/SpotCard';
import { SpotFilterBar } from '../../components/spots/SpotFilterBar';
import { SpotMapMock } from '../../components/spots/SpotMapMock';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { LayoutGrid, Map as MapIcon, RefreshCw, Compass } from 'lucide-react';

function ExploreContent() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<SpotsQueryParams>({
    query: searchParams.get('query') || undefined,
    category: (searchParams.get('category') as any) || undefined,
    noiseLevel: (searchParams.get('noiseLevel') as any) || undefined,
    wifiSpeed: (searchParams.get('wifiSpeed') as any) || undefined,
    outletDensity: (searchParams.get('outletDensity') as any) || undefined,
    sortBy: (searchParams.get('sortBy') as any) || 'popularity',
    page: 1,
    limit: 12,
  });

  const [data, setData] = useState<PaginatedResult<Spot>>({
    items: [],
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
    hasMore: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'split' | 'grid'>('split');
  const [selectedSpotId, setSelectedSpotId] = useState<string | undefined>(undefined);

  const fetchSpots = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await spotsApi.getSpots(filters);
      setData(res);
      if (res.items.length > 0 && !selectedSpotId) {
        setSelectedSpotId(res.items[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch spots:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, selectedSpotId]);

  useEffect(() => {
    fetchSpots();
  }, [fetchSpots]);

  const handleFilterChange = (newFilters: Partial<SpotsQueryParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleReset = () => {
    setFilters({
      query: undefined,
      category: undefined,
      noiseLevel: undefined,
      wifiSpeed: undefined,
      outletDensity: undefined,
      sortBy: 'popularity',
      page: 1,
      limit: 12,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Title and View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Explore Study Spots
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Discover {data.total} verified sanctuaries mapped with noise, power, and connectivity metrics
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-card border border-surface-border rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'split'
                ? 'bg-primary-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map &amp; Grid</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-primary-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid Only</span>
          </button>
        </div>
      </div>

      {/* Multi-Dimensional Filter Bar */}
      <SpotFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <LoadingSpinner label="Searching verified study locations..." />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No study spots match your criteria"
          description="Try adjusting your noise level, WiFi requirements, or clear your search term to see more locations."
          actionText="Reset All Filters"
          onActionClick={handleReset}
        />
      ) : viewMode === 'split' ? (
        /* Split Map & Cards Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Map Column (Sticky on Desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 h-[420px] lg:h-[calc(100vh-140px)]">
            <SpotMapMock
              spots={data.items}
              selectedSpotId={selectedSpotId}
              onSelectSpot={(spot) => setSelectedSpotId(spot._id)}
            />
          </div>

          {/* Cards Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.items.map((spot) => (
                <div
                  key={spot._id}
                  onClick={() => setSelectedSpotId(spot._id)}
                  className={`transition-all ${
                    selectedSpotId === spot._id ? 'ring-2 ring-primary-500 rounded-2xl' : ''
                  }`}
                >
                  <SpotCard spot={spot} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  onClick={() => handleFilterChange({ page: Math.max(1, (filters.page || 1) - 1) })}
                  disabled={(filters.page || 1) <= 1}
                  className="px-4 py-2 rounded-xl bg-surface border border-surface-border text-xs text-slate-300 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-400">
                  Page {data.page} of {data.totalPages}
                </span>
                <button
                  onClick={() => handleFilterChange({ page: (filters.page || 1) + 1 })}
                  disabled={(filters.page || 1) >= data.totalPages}
                  className="px-4 py-2 rounded-xl bg-surface border border-surface-border text-xs text-slate-300 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Grid Only Layout */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.items.map((spot) => (
              <SpotCard key={spot._id} spot={spot} />
            ))}
          </div>

          {/* Pagination Controls */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => handleFilterChange({ page: Math.max(1, (filters.page || 1) - 1) })}
                disabled={(filters.page || 1) <= 1}
                className="px-4 py-2 rounded-xl bg-surface border border-surface-border text-xs text-slate-300 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-slate-400">
                Page {data.page} of {data.totalPages}
              </span>
              <button
                onClick={() => handleFilterChange({ page: (filters.page || 1) + 1 })}
                disabled={(filters.page || 1) >= data.totalPages}
                className="px-4 py-2 rounded-xl bg-surface border border-surface-border text-xs text-slate-300 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading explore page..." />}>
      <ExploreContent />
    </Suspense>
  );
}
