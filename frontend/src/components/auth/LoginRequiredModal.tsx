'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Lock, X, Sparkles, ArrowRight } from 'lucide-react';

export const LoginRequiredModal: React.FC = () => {
  const { isLoginModalOpen, loginModalMessage, closeLoginModal } = useAuth();

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md p-6 bg-surface-card border border-surface-border rounded-2xl shadow-2xl text-slate-100">
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center mb-4 text-primary-400 shadow-glow">
            <Lock className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">Authentication Required</h3>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            {loginModalMessage}
          </p>

          <div className="w-full space-y-3">
            <Link
              href="/auth/login"
              onClick={closeLoginModal}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-glow transition-all"
            >
              <span>Log In to Your Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/auth/register"
              onClick={closeLoginModal}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-surface hover:bg-surface-border text-slate-200 font-medium rounded-xl border border-surface-border transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Create a Free Account</span>
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Join thousands of scholars and remote builders finding their flow state.
          </p>
        </div>
      </div>
    </div>
  );
};
