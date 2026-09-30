'use client';

import React, { useState } from 'react';
import { X, Sparkles, FolderPlus } from 'lucide-react';
import { savedSpotsApi } from '../../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateListModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState('#6366f1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const icons = ['🎯', '📚', '☕', '💡', '🌙', '💻', '🌿', '🏛️'];
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      await savedSpotsApi.createList({
        title: title.trim(),
        description: description.trim() || undefined,
        icon,
        color,
        isPublic: true,
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create study playlist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-surface-card border border-surface-border rounded-2xl shadow-2xl p-6 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Create Study Playlist</h3>
            <p className="text-xs text-slate-400">Organize spots for specific goals or routines</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Playlist Title
            </label>
            <input
              type="text"
              placeholder="e.g. Finals Week Sprints, Chill Weekend Reading..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="What makes this collection special?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Emoji Icon
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {icons.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`w-9 h-9 rounded-xl text-base flex items-center justify-center border transition-all ${
                    icon === ic
                      ? 'bg-primary-600/30 border-primary-400 shadow-glow scale-110'
                      : 'bg-surface border-surface-border hover:bg-surface-card'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
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
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium text-xs shadow-glow disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Creating...' : 'Create Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
