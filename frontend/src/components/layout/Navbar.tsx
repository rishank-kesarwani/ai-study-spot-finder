'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../ui/Logo';
import {
  Compass,
  Sparkles,
  Bookmark,
  User,
  LogOut,
  MapPin,
  Menu,
  X,
  Search,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/explore', label: 'Explore Spots', icon: Compass },
    { href: '/ai-concierge', label: 'AI Study Concierge', icon: Sparkles, highlight: true },
    { href: '/saved', label: 'Saved Spots', icon: Bookmark, requiresAuth: true },
  ];

  const handleProtectedClick = (e: React.MouseEvent, requiresAuth?: boolean) => {
    if (requiresAuth && !isAuthenticated) {
      e.preventDefault();
      openLoginModal('Log in to access your saved spots, custom playlists, and study preferences.');
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-background/85 border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Logo size="md" href="/" />

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleProtectedClick(e, link.requiresAuth)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-600/20 text-primary-300 border border-primary-500/40 shadow-glow'
                      : link.highlight
                      ? 'text-primary-400 hover:text-white hover:bg-primary-950/40 border border-primary-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-surface'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${link.highlight ? 'text-primary-400 animate-pulse' : ''}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Profile / Auth Action */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface border border-surface-border hover:border-slate-600 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary-500/20 text-primary-300 flex items-center justify-center font-bold text-xs border border-primary-500/30">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-white leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-400 leading-none mt-0.5">{user.studyPreferences?.studyPersona || 'Scholar'}</p>
                  </div>
                </Link>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white hover:bg-surface rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 rounded-xl shadow-glow transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-surface-border bg-surface-card px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  handleProtectedClick(e, link.requiresAuth);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-primary-600/20 text-primary-300 border border-primary-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-surface'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 border-t border-surface-border mt-4">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-200 hover:bg-surface"
                >
                  <User className="w-5 h-5 text-primary-400" />
                  <span>Profile & Study Persona</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/30"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-medium text-slate-200 bg-surface rounded-xl border border-surface-border"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-medium text-white bg-primary-600 rounded-xl shadow-glow"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
