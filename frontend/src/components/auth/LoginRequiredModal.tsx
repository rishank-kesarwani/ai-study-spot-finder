'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Lock, X, Sparkles, ArrowRight, Mail, AlertCircle, Loader2 } from 'lucide-react';

export const LoginRequiredModal: React.FC = () => {
  const { isLoginModalOpen, loginModalMessage, closeLoginModal, login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Form states
  const [email, setEmail] = useState('scholar@studyspot.ai');
  const [password, setPassword] = useState('DemoPassword123!');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (activeTab === 'signin') {
        await login(email, password, false);
      } else {
        if (!name.trim()) {
          setError('Please provide your name.');
          setIsLoading(false);
          return;
        }
        await register(name, email, password, false);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Authentication failed. Please check credentials.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md p-6 bg-surface-card border border-surface-border rounded-2xl shadow-2xl text-slate-100">
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center mb-3 text-primary-400 shadow-glow">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-white mb-1">Sign In to Continue</h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
            {loginModalMessage || 'Sign in to save your favourite study spots.'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 bg-surface rounded-xl border border-surface-border mb-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'signin'
                ? 'bg-primary-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'signup'
                ? 'bg-primary-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {activeTab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                placeholder="Alex Scholar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="scholar@studyspot.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
              required
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={closeLoginModal}
              className="flex-1 py-2.5 px-3 rounded-xl bg-surface hover:bg-surface-border text-slate-300 text-xs font-semibold border border-surface-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-glow disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{activeTab === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-surface-border/60 text-center text-[11px] text-slate-400">
          Demo: <span className="text-slate-200 font-mono">scholar@studyspot.ai</span> / <span className="text-slate-200 font-mono">DemoPassword123!</span>
        </div>
      </div>
    </div>
  );
};
