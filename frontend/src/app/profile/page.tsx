'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { NoiseLevel, SpotCategory } from '../../types';
import {
  User as UserIcon,
  Sparkles,
  Volume2,
  Wifi,
  Plug,
  Coffee,
  CheckCircle2,
  Save,
  Check,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, updatePreferences, openLoginModal } = useAuth();

  const [persona, setPersona] = useState('');
  const [favoriteDrink, setFavoriteDrink] = useState('');
  const [minWifi, setMinWifi] = useState(50);
  const [requiresOutlets, setRequiresOutlets] = useState(true);
  const [selectedNoise, setSelectedNoise] = useState<NoiseLevel[]>(['quiet']);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user?.studyPreferences) {
      setPersona(user.studyPreferences.studyPersona || 'Deep Work Scholar');
      setFavoriteDrink(user.studyPreferences.favoriteDrink || 'Matcha Latte & Pour-over');
      setMinWifi(user.studyPreferences.minWifiSpeedMbps || 50);
      setRequiresOutlets(user.studyPreferences.requiresOutlets ?? true);
      setSelectedNoise(user.studyPreferences.preferredNoiseLevels || ['quiet']);
    }
  }, [user]);

  if (isLoading) {
    return <LoadingSpinner label="Loading your study profile..." className="min-h-[50vh]" />;
  }

  if (!isAuthenticated || !user) {
    return (
      <EmptyState
        icon={UserIcon}
        title="Account & Study Preferences"
        description="Log in to configure your personalized study persona and noise tolerance settings for AI matching."
        actionText="Log In Now"
        onActionClick={() => openLoginModal()}
      />
    );
  }

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updatePreferences({
        studyPersona: persona,
        favoriteDrink,
        minWifiSpeedMbps: minWifi,
        requiresOutlets,
        preferredNoiseLevels: selectedNoise,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleNoise = (lvl: NoiseLevel) => {
    if (selectedNoise.includes(lvl)) {
      if (selectedNoise.length > 1) {
        setSelectedNoise(selectedNoise.filter((n) => n !== lvl));
      }
    } else {
      setSelectedNoise([...selectedNoise, lvl]);
    }
  };

  const personas = [
    'Deep Work Scholar',
    'Caffeine & Code Nomad',
    'Night Owl Researcher',
    'Creative & Conceptual Thinker',
    'Group Whiteboard Strategist',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Profile Header */}
      <div className="p-8 rounded-3xl bg-surface-card border border-surface-border flex flex-col sm:flex-row items-center gap-6 shadow-2xl">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center font-bold text-3xl shadow-glow">
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div className="text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30">
              {user.role}
            </span>
          </div>
          <p className="text-xs text-slate-400">{user.email}</p>
          <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
            <span className="text-xs px-3 py-1 rounded-lg bg-surface text-emerald-300 border border-surface-border font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {persona || 'Scholar'}
            </span>
          </div>
        </div>
      </div>

      {/* Study Preferences Form */}
      <div className="p-8 rounded-3xl bg-surface-card border border-surface-border space-y-6 shadow-2xl">
        <div className="border-b border-surface-border pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-400" />
            <span>AI Study Persona &amp; Acoustic Preferences</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            These settings automatically calibrate the StudySphere AI Concierge to tailor recommendations to your workflow.
          </p>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Study preferences saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSavePreferences} className="space-y-6">
          {/* Persona Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Primary Study Persona
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {personas.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPersona(p)}
                  className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                    persona === p
                      ? 'bg-primary-600/30 text-primary-300 border-primary-500 shadow-glow'
                      : 'bg-surface text-slate-300 border-surface-border hover:bg-surface-card'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Noise Tolerance */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Preferred Noise Levels (Select all that work for you)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['silent', 'quiet', 'moderate', 'buzzing'] as NoiseLevel[]).map((lvl) => {
                const isSelected = selectedNoise.includes(lvl);
                return (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => toggleNoise(lvl)}
                    className={`p-3 rounded-xl border text-xs font-semibold capitalize transition-all ${
                      isSelected
                        ? 'bg-primary-600/30 text-primary-300 border-primary-500 shadow-glow'
                        : 'bg-surface text-slate-400 border-surface-border hover:bg-surface-card'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* WiFi & Outlets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Wifi className="w-4 h-4 text-teal-400" />
                <span>Minimum WiFi Speed: {minWifi} Mbps</span>
              </label>
              <input
                type="range"
                min={10}
                max={300}
                step={10}
                value={minWifi}
                onChange={(e) => setMinWifi(Number(e.target.value))}
                className="w-full accent-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-amber-400" />
                <span>Favorite Focus Beverage</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Cortado, Matcha Latte, Oolong Tea"
                value={favoriteDrink}
                onChange={(e) => setFavoriteDrink(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          {/* Power Sockets Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface border border-surface-border">
            <div className="flex items-center gap-3">
              <Plug className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-xs font-bold text-white">Require Guaranteed Power Outlets</p>
                <p className="text-[11px] text-slate-400">Filter out spots without easily accessible charging</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={requiresOutlets}
              onChange={(e) => setRequiresOutlets(e.target.checked)}
              className="w-5 h-5 rounded accent-primary-500 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm shadow-glow disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Study Preferences'}</span>
          </button>
        </form>
      </div>

      {/* Check-In History */}
      {user.checkIns && user.checkIns.length > 0 && (
        <div className="p-8 rounded-3xl bg-surface-card border border-surface-border space-y-4 shadow-2xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Recent Check-In Activity</span>
          </h3>
          <div className="space-y-2">
            {user.checkIns.map((ci, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-surface border border-surface-border flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-white">{ci.spotName}</span>
                <span className="text-slate-400">{new Date(ci.visitedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
