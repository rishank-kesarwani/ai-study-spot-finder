'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { savedSpotsApi } from '../../services/api';
import { Spot, StudyList } from '../../types';
import { SpotCard } from '../../components/spots/SpotCard';
import { CreateListModal } from '../../components/lists/CreateListModal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Bookmark, FolderPlus, Folder, Trash2, ArrowRight } from 'lucide-react';

export default function SavedSpotsPage() {
  const { user, isAuthenticated, isLoading: authLoading, openLoginModal } = useAuth();
  const [savedSpots, setSavedSpots] = useState<Spot[]>([]);
  const [lists, setLists] = useState<StudyList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'spots' | 'lists'>('spots');

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [spotsRes, listsRes] = await Promise.all([
        savedSpotsApi.getSavedSpots(),
        savedSpotsApi.getLists(),
      ]);
      setSavedSpots(spotsRes);
      setLists(listsRes);
    } catch (err) {
      console.error('Failed to load saved data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setIsLoading(false);
      openLoginModal('Please log in to view your saved study spots and playlists.');
    } else if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, authLoading, openLoginModal, loadData]);

  const handleDeleteList = async (listId: string) => {
    try {
      await savedSpotsApi.deleteList(listId);
      setLists((prev) => prev.filter((l) => l._id !== listId));
    } catch (err) {
      console.error('Failed to delete list:', err);
    }
  };

  if (authLoading || isLoading) {
    return <LoadingSpinner label="Loading your saved spots..." className="min-h-[50vh]" />;
  }

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={Bookmark}
        title="Saved Spots & Collections"
        description="Log in to bookmark your favorite quiet cafes, silent libraries, and organize custom study playlists."
        actionText="Log In Now"
        onActionClick={() => openLoginModal()}
      />
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Saved Spots &amp; Playlists
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your personal focus spots and curated routine collections
          </p>
        </div>

        {/* Tab & Action Bar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-surface-card border border-surface-border rounded-xl">
            <button
              onClick={() => setActiveTab('spots')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'spots'
                  ? 'bg-primary-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmarks ({savedSpots.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('lists')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'lists'
                  ? 'bg-primary-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Playlists ({lists.length})</span>
            </button>
          </div>

          <button
            onClick={() => setIsCreateListOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-glow transition-all whitespace-nowrap"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Playlist</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'spots' ? (
        savedSpots.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No saved study spots yet"
            description="Explore our catalog and click the bookmark button on any spot card to save it for quick access."
            actionText="Explore Spots"
            actionHref="/explore"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedSpots.map((spot) => (
              <SpotCard
                key={spot._id}
                spot={spot}
                onBookmarkChange={(isSaved) => {
                  if (!isSaved) {
                    setSavedSpots((prev) => prev.filter((s) => s._id !== spot._id));
                  }
                }}
              />
            ))}
          </div>
        )
      ) : lists.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="No study playlists created"
          description="Create custom lists to group your study spots by goal, such as 'Finals Cramming', 'Quiet Reading', or 'Weekend Coding'."
          actionText="Create Your First Playlist"
          onActionClick={() => setIsCreateListOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => (
            <div
              key={list._id}
              className="p-6 rounded-2xl bg-surface-card border border-surface-border hover:border-primary-500/40 flex flex-col justify-between gap-4 shadow-xl transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-2xl shadow-inner">
                    {list.icon || '📚'}
                  </div>
                  <button
                    onClick={() => handleDeleteList(list._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{list.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {list.description || 'Custom curated study collection'}
                </p>
              </div>

              <div className="pt-3 border-t border-surface-border flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  {Array.isArray(list.spotIds) ? list.spotIds.length : 0} Spots Included
                </span>
                <Link
                  href="/explore"
                  className="text-primary-400 font-bold hover:text-primary-300 flex items-center gap-1"
                >
                  Explore More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create List Modal */}
      <CreateListModal
        isOpen={isCreateListOpen}
        onClose={() => setIsCreateListOpen(false)}
        onCreated={loadData}
      />
    </div>
  );
}
