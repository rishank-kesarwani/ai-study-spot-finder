import React from 'react';
import Link from 'next/link';
import { BookOpen, Sparkles, Shield, Cpu, Github, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-surface-border bg-surface/50 text-slate-400 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">StudySphere AI</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Autonomous AI Study Spot Intelligence. Discover quiet reading rooms, high-speed WiFi cafes, and late-night workspaces engineered for deep work and scholarly focus.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-card border border-surface-border">
                <Cpu className="w-3.5 h-3.5 text-primary-400" />
                Powered by AI Platform & Notification Service
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/explore?category=library" className="hover:text-primary-400 transition-colors">
                  Silent Libraries
                </Link>
              </li>
              <li>
                <Link href="/explore?category=cafe" className="hover:text-primary-400 transition-colors">
                  Laptop-Friendly Cafes
                </Link>
              </li>
              <li>
                <Link href="/explore?category=coworking" className="hover:text-primary-400 transition-colors">
                  24/7 Coworking Hubs
                </Link>
              </li>
              <li>
                <Link href="/ai-concierge" className="hover:text-primary-400 transition-colors">
                  AI Study Concierge
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Ecosystem</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/rishank-kesarwani/ai-platform"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-primary-400 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  AI Platform
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/rishank-kesarwani/notification-service"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-primary-400 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  Notification Service
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/rishank-kesarwani/ai-travel-planner"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-primary-400 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  AI Travel Planner
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 StudySphere AI. Designed for Senior Engineering Portfolio.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-0.5" /> for deep focus
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
