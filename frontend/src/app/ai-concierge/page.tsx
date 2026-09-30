'use client';

import React from 'react';
import { AiChatWidget } from '../../components/ai/AiChatWidget';
import { Sparkles, BrainCircuit, Zap, CheckCircle2, Shield } from 'lucide-react';

export default function AiConciergePage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-bold border border-primary-500/30">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Autonomous AI Study Spot Matcher</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          AI Study Spot Concierge
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed">
          Describe your study goals, noise preferences, connectivity requirements, or caffeine needs. Our AI assistant analyzes spatial metrics and acoustic data to pair you with the perfect environment.
        </p>
      </div>

      {/* Feature Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto text-xs text-slate-300">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-card border border-surface-border">
          <BrainCircuit className="w-4 h-4 text-primary-400 flex-shrink-0" />
          <span>Semantic Natural Language Task Parsing</span>
        </div>
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-card border border-surface-border">
          <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Contextual Acoustic Decibel Scoring</span>
        </div>
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-card border border-surface-border">
          <Shield className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Grounded in Curated Study Sanctuary Data</span>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto h-[680px]">
        <AiChatWidget />
      </div>
    </div>
  );
}
