'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Search,
  Compass,
  VolumeX,
  Wifi,
  Plug,
  MapPin,
  ArrowRight,
  BookOpen,
  Coffee,
  Laptop,
  GraduationCap,
  Trees,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { spotsApi } from '../services/api';
import { Spot } from '../types';
import { SpotCard } from '../components/spots/SpotCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export default function HomePage() {
  const router = useRouter();
  const [featuredSpots, setFeaturedSpots] = useState<Spot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const spots = await spotsApi.getFeatured();
        setFeaturedSpots(spots);
      } catch (err) {
        console.error('Failed to load featured spots:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadFeatured();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/explore');
    }
  };

  const categoryCards = [
    {
      title: 'Silent Libraries',
      description: 'Zero-tolerance quiet zones with historic architecture and wide desks.',
      icon: BookOpen,
      href: '/explore?category=library',
      color: 'from-indigo-600/20 to-blue-600/10 border-indigo-500/30 text-indigo-400',
    },
    {
      title: 'Artisan Coffee Roasters',
      description: 'Specialty pour-overs, abundant power strips, and lively acoustic playlists.',
      icon: Coffee,
      href: '/explore?category=cafe',
      color: 'from-amber-600/20 to-orange-600/10 border-amber-500/30 text-amber-400',
    },
    {
      title: '24/7 Hacker & Coworking',
      description: 'Gigabit fiber WiFi, Herman Miller chairs, dual monitors, and round-the-clock access.',
      icon: Laptop,
      href: '/explore?category=coworking',
      color: 'from-emerald-600/20 to-teal-600/10 border-emerald-500/30 text-emerald-400',
    },
    {
      title: 'University Commons',
      description: 'Acoustic study pods, massive magnetic whiteboards, and academic hubs.',
      icon: GraduationCap,
      href: '/explore?category=university_campus',
      color: 'from-purple-600/20 to-pink-600/10 border-purple-500/30 text-purple-400',
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative pt-6 pb-12 md:py-16 flex flex-col items-center text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-72 bg-primary-600/15 blur-[120px] rounded-full pointer-events-none" />

        {/* AI Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-card border border-primary-500/30 text-primary-300 text-xs font-semibold mb-6 shadow-glow">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Autonomous Study Spot Intelligence &amp; Acoustic Matching</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.15] mb-6">
          Find the Perfect Study Sanctuary for Your{' '}
          <span className="bg-gradient-to-r from-primary-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            Deep Work Flow State
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mb-10 leading-relaxed">
          Discover verified libraries, quiet coffee roasteries, and 24/7 coworking hubs benchmarked by noise levels, WiFi speeds, power outlet density, and study comfort.
        </p>

        {/* Global Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="w-full max-w-2xl relative flex items-center bg-surface-card/90 backdrop-blur-xl border border-surface-border hover:border-primary-500/60 p-2 rounded-2xl shadow-2xl transition-all"
        >
          <Search className="w-5 h-5 text-slate-400 ml-3" />
          <input
            type="text"
            placeholder="Search by spot name, neighborhood, 'matcha latte', 'fast wifi'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2.5 bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-glow transition-all whitespace-nowrap"
          >
            Explore Spots
          </button>
        </form>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 w-full max-w-4xl text-left">
          <div className="p-4 rounded-xl bg-surface/60 border border-surface-border">
            <div className="flex items-center gap-2 text-primary-400 mb-1">
              <VolumeX className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Acoustics</span>
            </div>
            <p className="text-xl font-bold text-white">Silent to Buzz</p>
            <p className="text-xs text-slate-400">Verified noise decibels</p>
          </div>

          <div className="p-4 rounded-xl bg-surface/60 border border-surface-border">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <Wifi className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Fiber WiFi</span>
            </div>
            <p className="text-xl font-bold text-white">Up to 500 Mbps</p>
            <p className="text-xs text-slate-400">Tested download benchmarks</p>
          </div>

          <div className="p-4 rounded-xl bg-surface/60 border border-surface-border">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Plug className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Outlets</span>
            </div>
            <p className="text-xl font-bold text-white">Every Desk</p>
            <p className="text-xs text-slate-400">Mapped power socket access</p>
          </div>

          <div className="p-4 rounded-xl bg-surface/60 border border-surface-border">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">AI Concierge</span>
            </div>
            <p className="text-xl font-bold text-white">Gemini Pro</p>
            <p className="text-xs text-slate-400">Contextual task matching</p>
          </div>
        </div>
      </section>

      {/* AI Concierge Spotlight Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-950 via-indigo-950/80 to-surface-card border border-primary-500/40 p-8 sm:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-bold border border-primary-500/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive AI Assistant</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Not sure where to study today? Let our AI Concierge match you.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Tell StudySphere AI about your task (e.g., "I need a silent library with high ceilings for my dissertation" or "a buzzing Brooklyn roastery with great iced matcha and fast wifi for coding"). Get instant grounded recommendations with match scores and tips.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/ai-concierge"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm shadow-glow transition-all"
            >
              <span>Launch AI Study Concierge</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/explore"
              className="px-5 py-3 rounded-xl bg-surface hover:bg-surface-border text-slate-200 text-sm font-medium border border-surface-border transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Curated Study Categories
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Choose your ideal focus environment and seating posture
            </p>
          </div>
          <Link
            href="/explore"
            className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1"
          >
            View All Categories →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryCards.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.title}
                href={cat.href}
                className={`p-6 rounded-2xl bg-gradient-to-br ${cat.color} border hover:scale-[1.02] transition-all flex flex-col justify-between gap-4 group`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-surface/80 flex items-center justify-center mb-4 text-white shadow-md">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-primary-300 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <span className="text-xs font-semibold text-white flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Explore category <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Spots Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Top-Rated Focus Spots
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Community-vetted sanctuaries with highest ratings for noise control &amp; reliability
            </p>
          </div>
          <Link
            href="/explore?sortBy=rating"
            className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1"
          >
            See all spots →
          </Link>
        </div>

        {isLoading ? (
          <LoadingSpinner label="Loading top-rated study spots..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSpots.map((spot) => (
              <SpotCard key={spot._id} spot={spot} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
