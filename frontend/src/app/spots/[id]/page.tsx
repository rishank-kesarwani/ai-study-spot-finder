'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { spotsApi, reviewsApi } from '../../../services/api';
import { Spot, Review, PaginatedResult } from '../../../types';
import { NoiseBadge } from '../../../components/ui/NoiseBadge';
import { WifiSpeedMeter } from '../../../components/ui/WifiSpeedMeter';
import { OutletBadge } from '../../../components/ui/OutletBadge';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { AddReviewModal } from '../../../components/reviews/AddReviewModal';
import { useAuth } from '../../../context/AuthContext';
import {
  Star,
  Bookmark,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Clock,
  ExternalLink,
  Phone,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  Armchair,
  Share2,
} from 'lucide-react';

export default function SpotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isAuthenticated, openLoginModal, savedSpotIds, setSavedSpotIds } = useAuth();

  const [spot, setSpot] = useState<Spot | null>(null);
  const [reviewsData, setReviewsData] = useState<PaginatedResult<Review>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasMore: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckInLoading, setIsCheckInLoading] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isSaved = spot ? savedSpotIds.includes(spot._id) : false;

  const loadSpotData = useCallback(async () => {
    if (!id) return;
    try {
      const [spotRes, reviewsRes] = await Promise.all([
        spotsApi.getById(id),
        reviewsApi.getSpotReviews(id, 1, 10),
      ]);
      setSpot(spotRes);
      setReviewsData(reviewsRes);
    } catch (err) {
      console.error('Failed to load spot details:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSpotData();
  }, [loadSpotData]);

  const handleBookmarkToggle = async () => {
    if (!spot) return;
    if (!isAuthenticated) {
      openLoginModal('Log in to bookmark this study spot to your collections.');
      return;
    }

    try {
      setIsSaving(true);
      const res = await spotsApi.toggleSave(spot._id);
      setSavedSpotIds(res.savedSpotIds);
      setSpot((prev) => (prev ? { ...prev, savedCount: prev.savedCount + (res.isSaved ? 1 : -1) } : null));
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCheckIn = async () => {
    if (!spot) return;
    if (!isAuthenticated) {
      openLoginModal('Log in to record your study check-in.');
      return;
    }

    try {
      setIsCheckInLoading(true);
      const res = await spotsApi.checkIn(spot._id);
      setIsCheckedIn(true);
      setSpot((prev) => (prev ? { ...prev, checkInCount: res.checkInCount } : null));
    } catch (err) {
      console.error('Check-in failed:', err);
    } finally {
      setIsCheckInLoading(false);
    }
  };

  const handleHelpfulVote = async (reviewId: string) => {
    if (!isAuthenticated) {
      openLoginModal('Log in to vote on helpful community tips.');
      return;
    }

    try {
      const res = await reviewsApi.toggleHelpful(reviewId);
      setReviewsData((prev) => ({
        ...prev,
        items: prev.items.map((r) =>
          r._id === reviewId ? { ...r, helpfulCount: res.helpfulCount } : r,
        ),
      }));
    } catch (err) {
      console.error('Helpful vote failed:', err);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading study spot details..." className="min-h-[50vh]" />;
  }

  if (!spot) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-2xl font-bold text-white">Study Spot Not Found</h2>
        <p className="text-sm text-slate-400">The study spot you are looking for does not exist or has been relocated.</p>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-medium shadow-glow"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Link>
      </div>
    );
  }

  const defaultPhoto =
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="space-y-8 pb-16">
      {/* Back Link */}
      <Link
        href="/explore"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Explore Spots
      </Link>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg bg-surface text-primary-300 border border-surface-border">
              {spot.category.replace('_', ' ')}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-700/40 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Location
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {spot.name}
          </h1>

          <p className="flex items-center gap-1.5 text-sm text-slate-400 mt-2">
            <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span>{spot.address}</span>
            <span>•</span>
            <span className="text-slate-300">{spot.city}</span>
          </p>
        </div>

        {/* Action Buttons: Check-in, Bookmark, Review */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleCheckIn}
            disabled={isCheckInLoading || isCheckedIn}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              isCheckedIn
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-glow-emerald'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isCheckedIn ? 'Checked In Today! 📍' : 'Check In Here'}</span>
          </button>

          <button
            onClick={handleBookmarkToggle}
            disabled={isSaving}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              isSaved
                ? 'bg-primary-600 text-white border-primary-400 shadow-glow'
                : 'bg-surface text-slate-200 hover:text-white border-surface-border hover:bg-surface-card'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save Spot'}</span>
          </button>

          <button
            onClick={() => {
              if (!isAuthenticated) {
                openLoginModal('Log in to submit a review.');
              } else {
                setIsReviewModalOpen(true);
              }
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-card text-primary-300 font-semibold text-sm border border-primary-500/30 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Add Review</span>
          </button>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 h-72 sm:h-96 rounded-2xl overflow-hidden bg-surface border border-surface-border relative">
          <img
            src={spot.photos?.[0] || defaultPhoto}
            alt={spot.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="grid grid-rows-2 gap-4 h-72 sm:h-96">
          <div className="rounded-2xl overflow-hidden bg-surface border border-surface-border">
            <img
              src={spot.photos?.[1] || defaultPhoto}
              alt={`${spot.name} view 2`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="rounded-2xl overflow-hidden bg-surface border border-surface-border relative flex items-center justify-center bg-surface-card">
            <div className="p-6 text-center space-y-2">
              <Star className="w-8 h-8 text-amber-400 fill-amber-400 mx-auto" />
              <p className="text-2xl font-bold text-white">{spot.rating.toFixed(1)} / 5.0</p>
              <p className="text-xs text-slate-400">{spot.reviewCount} Community Acoustic Ratings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Noise Benchmark */}
        <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Acoustic Noise</p>
          <NoiseBadge level={spot.noiseLevel} size="md" />
        </div>

        {/* WiFi Speed Benchmark */}
        <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tested WiFi Speed</p>
          <WifiSpeedMeter speed={spot.wifiSpeed} mbps={spot.wifiSpeedMbps} size="md" />
        </div>

        {/* Outlet Density */}
        <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Power Sockets</p>
          <OutletBadge density={spot.outletDensity} size="md" />
        </div>

        {/* Seating Posture */}
        <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Seating Ergonomics</p>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Armchair className="w-4 h-4 text-primary-400" />
            <span className="capitalize">{spot.seatingComfort.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Main Details and Side Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: AI Highlights & Amenities */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Intelligence Summary */}
          {spot.aiSummary && (
            <div className="p-6 rounded-2xl bg-surface-card border border-primary-500/30 space-y-3">
              <div className="flex items-center gap-2 text-primary-400 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>AI Focus Intelligence Summary</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{spot.aiSummary}</p>
              {spot.bestFor && (
                <div className="pt-2 border-t border-surface-border/50 text-xs text-slate-300">
                  <span className="font-semibold text-primary-300">Best for: </span>
                  {spot.bestFor}
                </div>
              )}
            </div>
          )}

          {/* Insider Tip */}
          {spot.insiderTip && (
            <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                💡 Local Scholar Insider Tip
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed">{spot.insiderTip}</p>
            </div>
          )}

          {/* Amenities & Study Infrastructure */}
          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4">
            <h3 className="text-base font-bold text-white">Study Amenities &amp; Infrastructure</h3>
            <div className="flex flex-wrap gap-2">
              {spot.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="text-xs font-medium px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-slate-300 capitalize"
                >
                  ✓ {amenity.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>

          {/* Community Reviews Section */}
          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Community Reviews &amp; Reports</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified feedback from scholars, researchers, and remote builders
                </p>
              </div>
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    openLoginModal('Log in to add your review.');
                  } else {
                    setIsReviewModalOpen(true);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-xs shadow-glow transition-all"
              >
                + Write Review
              </button>
            </div>

            {reviewsData.items.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No reviews submitted yet. Be the first to verify this study spot!
              </div>
            ) : (
              <div className="space-y-4">
                {reviewsData.items.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-4 rounded-xl bg-surface border border-surface-border space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary-600/20 text-primary-300 font-bold text-xs flex items-center justify-center border border-primary-500/30">
                          {rev.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{rev.userName}</p>
                          <div className="flex items-center gap-1 text-[11px] text-amber-400">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{rev.rating} / 5</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <NoiseBadge level={rev.noiseReported} size="sm" />
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed">{rev.content}</p>

                    {rev.proTip && (
                      <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border text-[11px] text-amber-300/90">
                        <span className="font-semibold text-amber-400">Pro Tip: </span>
                        {rev.proTip}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-surface-border/50 text-[11px] text-slate-400">
                      <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                      <button
                        onClick={() => handleHelpfulVote(rev._id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-card hover:bg-surface-border text-slate-300 hover:text-white transition-colors"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>Helpful ({rev.helpfulCount})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Opening Hours & Contact Details */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-400" />
              <span>Opening Hours</span>
            </h3>

            <div className="space-y-2 text-xs text-slate-300">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
                (day) => (
                  <div key={day} className="flex items-center justify-between py-1 border-b border-surface-border/40">
                    <span className="capitalize font-medium text-slate-400">{day}</span>
                    <span className="font-semibold text-white">08:00 AM - 10:00 PM</span>
                  </div>
                ),
              )}
            </div>

            {spot.websiteUrl && (
              <div className="pt-2">
                <a
                  href={spot.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-surface hover:bg-surface-border border border-surface-border text-xs font-semibold text-primary-300 transition-colors"
                >
                  <span>Official Venue Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Review Modal */}
      <AddReviewModal
        spotId={spot._id}
        spotName={spot.name}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={loadSpotData}
      />
    </div>
  );
}
