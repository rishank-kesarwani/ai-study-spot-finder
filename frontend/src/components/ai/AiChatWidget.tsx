'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User as UserIcon,
  CheckCircle2,
  ArrowRight,
  Wifi,
  Volume2,
  Cpu,
} from 'lucide-react';
import { ChatMessage, RecommendedSpotMatch } from '../../types';
import { aiConciergeApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AiChatWidget: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello ${user ? user.name : 'there'}! I'm StudySphere AI, your intelligent study spot concierge. Tell me what you're working on (e.g. "I need a silent library with high ceilings and outlets for thesis writing" or "a buzzing cafe in Brooklyn with fast WiFi and matcha for coding") and I'll match the best spots for you.`,
    },
  ]);
  const [suggestedSpots, setSuggestedSpots] = useState<RecommendedSpotMatch[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    '🤫 Silent library for intense thesis writing',
    '☕ Brooklyn roastery with 100+ Mbps WiFi & outlets',
    '🌙 24/7 late night cafe for overnight exam prep',
    '🌿 Sunlit botanical lounge with comfortable seating',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, suggestedSpots, isLoading]);

  const handleSend = async (userText?: string) => {
    const text = userText || input;
    if (!text.trim() || isLoading) return;

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: text.trim() },
    ];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiConciergeApi.chat({
        messages: newMessages,
        useRag: true,
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.reply },
      ]);

      if (response.enrichedSpots && response.enrichedSpots.length > 0) {
        setSuggestedSpots(response.enrichedSpots);
      } else if (response.suggestedSpots && response.suggestedSpots.length > 0) {
        setSuggestedSpots(response.suggestedSpots);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I encountered a brief connection delay with the AI Platform, but I recommend checking out "The Rose Main Reading Room" for silent study or "Atelier Artisan Roasters" for high-speed coding sessions.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-card border border-surface-border rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-surface border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-glow">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              StudySphere AI Concierge
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/40">
                Active Intelligence
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Personalized semantic matching powered by AI Platform
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-surface-card px-3 py-1.5 rounded-xl border border-surface-border">
          <Cpu className="w-3.5 h-3.5 text-primary-400" />
          <span>RAG Knowledge Grounded</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[500px]">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs flex-shrink-0 ${
                  isUser
                    ? 'bg-primary-600 text-white'
                    : 'bg-surface border border-surface-border text-primary-400'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? 'bg-primary-600 text-white rounded-tr-none shadow-glow'
                    : 'bg-surface text-slate-200 border border-surface-border rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-primary-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-surface border border-surface-border rounded-tl-none flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
              <span>Analyzing ambient acoustic profiles and study criteria...</span>
            </div>
          </div>
        )}

        {/* Suggested Spot Cards */}
        {suggestedSpots.length > 0 && !isLoading && (
          <div className="pt-4 border-t border-surface-border/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary-300 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              AI Recommended Study Spots
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestedSpots.map((rec, i) => (
                <div
                  key={i}
                  className="bg-surface p-4 rounded-xl border border-primary-500/30 hover:border-primary-400 flex flex-col justify-between gap-3 shadow-lg transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h5 className="text-sm font-bold text-white line-clamp-1">{rec.name}</h5>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-700/40 whitespace-nowrap">
                        {rec.matchScore}% Match
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-2">
                      {rec.matchReason}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {rec.bestFeatures?.map((feat, fi) => (
                        <span
                          key={fi}
                          className="text-[10px] px-2 py-0.5 rounded bg-surface-card text-slate-400 border border-surface-border"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-surface-border/50 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-amber-300/90 font-medium">
                      🎯 {rec.recommendedStudyType}
                    </span>
                    {rec.spot?._id ? (
                      <Link
                        href={`/spots/${rec.spot._id}`}
                        className="text-primary-400 font-bold hover:text-primary-300 flex items-center gap-1"
                      >
                        View Spot →
                      </Link>
                    ) : (
                      <Link
                        href={`/explore?query=${encodeURIComponent(rec.name)}`}
                        className="text-primary-400 font-bold hover:text-primary-300 flex items-center gap-1"
                      >
                        Find in Catalog →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-6 py-2 bg-surface/50 border-t border-surface-border overflow-x-auto flex items-center gap-2 scrollbar-none">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-border text-slate-300 hover:text-white border border-surface-border whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 bg-surface border-t border-surface-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Describe your ideal study setting (noise, wifi speed, neighborhood, vibe)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl bg-surface-card border border-surface-border text-sm text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white shadow-glow transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
