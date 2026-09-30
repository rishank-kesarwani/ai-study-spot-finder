'use client';

import React, { useState } from 'react';
import { X, Star, Volume2, Wifi, Plug, Sparkles } from 'lucide-react';
import { NoiseLevel, OutletDensity, WifiSpeed } from '../../types';
import { reviewsApi } from '../../services/api';

interface Props {
  spotId: string;
  spotName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddReviewModal: React.FC<Props> = ({
  spotId,
  spotName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState(5);
  const [noiseReported, setNoiseReported] = useState<NoiseLevel>('quiet');
  const [wifiReported, setWifiReported] = useState<WifiSpeed>('fast');
  const [outletsReported, setOutletsReported] = useState<OutletDensity>('abundant');
  const [content, setContent] = useState('');
  const [proTip, setProTip] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 10) {
      setError('Please provide at least 10 characters describing the study experience.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await reviewsApi.createReview(spotId, {
        rating,
        noiseReported,
        wifiReported,
        outletsReported,
        content: content.trim(),
        proTip: proTip.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-surface-card border border-surface-border rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">
          Review & Acoustic Report
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Share your study experience and verified noise/wifi metrics for <span className="text-primary-300 font-semibold">{spotName}</span>.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Rating Stars */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Overall Study Score
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-2xl focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-amber-400 ml-2">
                {rating} of 5 stars
              </span>
            </div>
          </div>

          {/* Noise Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              Observed Noise Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['silent', 'quiet', 'moderate', 'buzzing'] as NoiseLevel[]).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setNoiseReported(lvl)}
                  className={`p-2.5 rounded-xl border text-xs font-medium capitalize transition-all ${
                    noiseReported === lvl
                      ? 'bg-primary-600/30 text-primary-300 border-primary-500 shadow-glow'
                      : 'bg-surface text-slate-300 border-surface-border hover:bg-surface-card'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* WiFi Speed */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-teal-400" />
              WiFi Speed Rating
            </label>
            <select
              value={wifiReported}
              onChange={(e) => setWifiReported(e.target.value as WifiSpeed)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white focus:outline-none focus:border-primary-500"
            >
              <option value="ultra_fast">🚀 Ultra Fiber (&gt; 100 Mbps)</option>
              <option value="fast">⚡ Fast (30 - 100 Mbps)</option>
              <option value="decent">📶 Decent (10 - 30 Mbps)</option>
              <option value="slow_none">⚠️ Slow / Offline Focus Only</option>
            </select>
          </div>

          {/* Power Outlets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Plug className="w-3.5 h-3.5 text-amber-400" />
              Power Outlet Availability
            </label>
            <select
              value={outletsReported}
              onChange={(e) => setOutletsReported(e.target.value as OutletDensity)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white focus:outline-none focus:border-primary-500"
            >
              <option value="abundant">🔌 Outlets at Every Desk / Table</option>
              <option value="moderate">⚡ Accessible near Walls &amp; Booths</option>
              <option value="scarce">⚠️ Limited Outlets in Venue</option>
              <option value="none">🔋 Battery Power Required</option>
            </select>
          </div>

          {/* Written Review */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Study Experience Review
            </label>
            <textarea
              rows={3}
              placeholder="How was the desk comfort, ambient lighting, coffee quality, and overall vibe for studying?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
              required
            />
          </div>

          {/* Insider Tip */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Insider Tip (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Best tables in the back corner, quietest hours before 11 AM..."
              value={proTip}
              onChange={(e) => setProTip(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium text-xs shadow-glow disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Verified Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
