import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GroupPost, ViewTab, FilterState, FBGroup } from './types';
import { FB_GROUPS_LIST } from './data/groupList';
import {
  loadPosts,
  savePosts,
  loadSettings,
  saveSettings,
  loadArchivedExpired,
  saveArchivedExpired,
  loadGroupVisits,
  recordGroupVisit,
  purgeExpiredPosts,
} from './utils/storage';
import { generateRandomRadarPost, generateInitialPosts } from './utils/sampleData';
import { playNotificationSound } from './utils/audio';
import { RETENTION_PERIOD_MS } from './utils/time';

// Components
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { PostCard } from './components/PostCard';
import { PopupAlerts, ActivePopupNotification } from './components/PopupAlerts';
import { GroupDirectory } from './components/GroupDirectory';
import { QuickIngestModal } from './components/QuickIngestModal';
import { KeywordManagerModal } from './components/KeywordManagerModal';
import { SettingsModal } from './components/SettingsModal';
import { ArchivedExpiredView } from './components/ArchivedExpiredView';
import { SpeedReaderBar } from './components/SpeedReaderBar';
import { Clock, Radio, Sparkles, Plus, RefreshCw, Flame } from 'lucide-react';

export default function App() {
  const [posts, setPosts] = useState<GroupPost[]>(() => loadPosts());
  const [archivedPosts, setArchivedPosts] = useState<GroupPost[]>(() => loadArchivedExpired());
  const [visits, setVisits] = useState<Record<string, number>>(() => loadGroupVisits());
  const [settings, setSettings] = useState(() => loadSettings());

  const [currentTab, setCurrentTab] = useState<ViewTab>('feed');
  const [now, setNow] = useState(Date.now());
  const [popups, setPopups] = useState<ActivePopupNotification[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const [filter, setFilter] = useState<FilterState>({
    search: '',
    category: 'all',
    status: 'all',
    sortBy: 'newest',
  });

  // Modals
  const [isQuickIngestOpen, setIsQuickIngestOpen] = useState(false);
  const [preselectedGroup, setPreselectedGroup] = useState<FBGroup | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isKeywordModalOpen, setIsKeywordModalOpen] = useState(false);

  // 1. Clock interval for countdown timers and live UI updates
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Strict 24-Hour Expiration & Auto-Purge Lifecycle
  useEffect(() => {
    if (!settings.autoPurgeExpired) return;

    const purgeInterval = setInterval(() => {
      setPosts((currentPosts) => {
        const { remaining, purged } = purgeExpiredPosts(currentPosts, true);
        if (purged.length > 0) {
          setArchivedPosts((prev) => [...purged, ...prev]);
        }
        return remaining;
      });
    }, 4000); // Check every 4 seconds

    return () => clearInterval(purgeInterval);
  }, [settings.autoPurgeExpired]);

  // Persist posts whenever they change
  useEffect(() => {
    savePosts(posts);
  }, [posts]);

  // Persist settings whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // 3. Helper to trigger new post popup and sound alert
  const dispatchNewPost = useCallback(
    (post: GroupPost) => {
      // Add to state
      setPosts((prev) => [post, ...prev]);

      // Trigger audio chime if enabled
      if (settings.soundAlerts) {
        playNotificationSound(post.priority === 'high' ? 'alert' : 'post');
      }

      // Trigger browser desktop notification if enabled
      if (settings.desktopNotifications && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(`⚡ New Post in ${post.groupName}`, {
            body: `${post.authorName}: ${post.content.slice(0, 100)}...`,
            icon: '/favicon.ico',
          });
        } catch {
          // ignore
        }
      }

      // Add to active floating popups stack (limit to max 3 concurrent)
      const popupId = `popup_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      setPopups((prev) => [{ id: popupId, post, receivedAt: Date.now() }, ...prev.slice(0, 2)]);

      // Auto-dismiss popup after 8 seconds (post remains in the feed!)
      setTimeout(() => {
        setPopups((curr) => curr.filter((p) => p.id !== popupId));
      }, 8000);
    },
    [settings.soundAlerts, settings.desktopNotifications]
  );

  // 4. Background Radar Stream interval
  useEffect(() => {
    if (!settings.radarActive) return;

    const intervalMs = Math.max(10, settings.radarIntervalSec) * 1000;
    const radarTimer = setInterval(() => {
      const generated = generateRandomRadarPost(settings.monitoredKeywords);
      dispatchNewPost(generated);
    }, intervalMs);

    return () => clearInterval(radarTimer);
  }, [settings.radarActive, settings.radarIntervalSec, settings.monitoredKeywords, dispatchNewPost]);

  // 5. Ingest from URL Query Params (e.g. from 1-Click Bookmarklet)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const ingestPayload = params.get('ingest') || params.get('new_post');

    if (ingestPayload) {
      try {
        const data = JSON.parse(decodeURIComponent(ingestPayload));
        const matchingGroup = FB_GROUPS_LIST.find((g) =>
          data.url?.toLowerCase().includes(g.slug.toLowerCase())
        ) || FB_GROUPS_LIST[0];

        const newPost: GroupPost = {
          id: `post_bm_${Date.now()}`,
          groupId: matchingGroup.id,
          groupName: matchingGroup.name,
          groupUrl: matchingGroup.url,
          authorName: data.author || 'Facebook Member',
          content: data.text || 'Imported group post',
          postUrl: data.url || matchingGroup.url,
          createdAt: Date.now(),
          expiresAt: Date.now() + RETENTION_PERIOD_MS,
          isStarred: false,
          isRead: false,
          tags: [matchingGroup.category],
          matchedKeywords: settings.monitoredKeywords.filter((kw) =>
            (data.text || '').toLowerCase().includes(kw.toLowerCase())
          ),
          priority: 'normal',
        };

        dispatchNewPost(newPost);

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error('Failed to parse incoming bookmarklet payload', err);
      }
    }
  }, [dispatchNewPost, settings.monitoredKeywords]);

  // 6. Action Handlers
  const handleOpenFB = (post: GroupPost) => {
    // Record visit
    const updatedVisits = recordGroupVisit(post.groupId);
    setVisits(updatedVisits);

    // Mark as read
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, isRead: true } : p))
    );

    // Open link
    window.open(post.postUrl || post.groupUrl, '_blank', 'noopener,noreferrer');
  };

  const handleToggleStar = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isStarred: !p.isStarred } : p))
    );
  };

  const handleToggleRead = (postId: string) => {
    setSelectedPostId(postId);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isRead: !p.isRead } : p))
    );
  };

  const handleDismissPost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    if (selectedPostId === postId) {
      setSelectedPostId(null);
    }
  };

  const handleManualPurge = () => {
    const { remaining, purged } = purgeExpiredPosts(posts, true);
    setPosts(remaining);
    setArchivedPosts((prev) => [...purged, ...prev]);
    setIsSettingsOpen(false);
  };

  const handleResetSampleData = () => {
    const fresh = generateInitialPosts();
    setPosts(fresh);
    savePosts(fresh);
    setIsSettingsOpen(false);
  };

  const handleRestoreArchivedPost = (post: GroupPost) => {
    const renewedPost: GroupPost = {
      ...post,
      id: `post_renewed_${Date.now()}`,
      createdAt: Date.now(),
      expiresAt: Date.now() + RETENTION_PERIOD_MS,
      isRead: false,
    };
    setPosts((prev) => [renewedPost, ...prev]);
    setArchivedPosts((prev) => prev.filter((p) => p.id !== post.id));
    saveArchivedExpired(archivedPosts.filter((p) => p.id !== post.id));
    dispatchNewPost(renewedPost);
  };

  const handleClearArchive = () => {
    setArchivedPosts([]);
    saveArchivedExpired([]);
  };

  // Group visits handler
  const handleVisitGroup = (groupId: string, url: string) => {
    const updated = recordGroupVisit(groupId);
    setVisits(updated);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleQuickIngestForGroup = (group: FBGroup) => {
    setPreselectedGroup(group);
    setIsQuickIngestOpen(true);
  };

  // 7. Filtered and Sorted Posts Calculation
  const categories = useMemo(() => {
    const set = new Set<string>();
    FB_GROUPS_LIST.forEach((g) => set.add(g.category));
    return Array.from(set).sort();
  }, []);

  const activePostCountsByGroup = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((p) => {
      counts[p.groupId] = (counts[p.groupId] || 0) + 1;
    });
    return counts;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Category filter
      if (filter.category !== 'all' && post.tags?.[0] !== filter.category) {
        return false;
      }
      // Status filter
      if (filter.status === 'unread' && post.isRead) return false;
      if (filter.status === 'starred' && !post.isStarred) return false;
      if (filter.status === 'high_priority' && post.priority !== 'high') return false;
      if (filter.status === 'expiring_soon') {
        const diff = post.expiresAt - now;
        if (diff > 2 * 60 * 60 * 1000) return false;
      }

      // Search query
      if (filter.search.trim()) {
        const q = filter.search.toLowerCase();
        const inContent = post.content.toLowerCase().includes(q);
        const inGroup = post.groupName.toLowerCase().includes(q);
        const inAuthor = post.authorName.toLowerCase().includes(q);
        const inKeywords = (post.matchedKeywords || []).some((kw) => kw.toLowerCase().includes(q));
        if (!inContent && !inGroup && !inAuthor && !inKeywords) {
          return false;
        }
      }

      return true;
    });
  }, [posts, filter, now]);

  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      if (filter.sortBy === 'expiring_soon') {
        return a.expiresAt - b.expiresAt;
      }
      if (filter.sortBy === 'priority') {
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (b.priority === 'high' && a.priority !== 'high') return 1;
      }
      return b.createdAt - a.createdAt; // default newest
    });
  }, [filteredPosts, filter.sortBy]);

  // Statistics
  const expiringSoonCount = useMemo(() => {
    return posts.filter((p) => p.expiresAt - now > 0 && p.expiresAt - now <= 2 * 60 * 60 * 1000).length;
  }, [posts, now]);

  const highPriorityCount = useMemo(() => {
    return posts.filter((p) => p.priority === 'high').length;
  }, [posts]);

  // 8. Keyboard Navigation Shortcut bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if inside input, textarea, or select
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        if (sortedPosts.length === 0) return;
        const currentIndex = sortedPosts.findIndex((p) => p.id === selectedPostId);
        const nextIndex = currentIndex < sortedPosts.length - 1 ? currentIndex + 1 : 0;
        setSelectedPostId(sortedPosts[nextIndex].id);
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        if (sortedPosts.length === 0) return;
        const currentIndex = sortedPosts.findIndex((p) => p.id === selectedPostId);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : sortedPosts.length - 1;
        setSelectedPostId(sortedPosts[prevIndex].id);
      } else if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        const selected = sortedPosts.find((p) => p.id === selectedPostId);
        if (selected) {
          handleOpenFB(selected);
        }
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (selectedPostId) {
          handleToggleStar(selectedPostId);
        }
      } else if (e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        if (selectedPostId) {
          handleDismissPost(selectedPostId);
        }
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sortedPosts, selectedPostId]);

  const selectedPost = sortedPosts.find((p) => p.id === selectedPostId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16">
      {/* Header with Top Bar Contract */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeCount={posts.length}
        expiringSoonCount={expiringSoonCount}
        radarActive={settings.radarActive}
        onToggleRadar={() =>
          setSettings((prev) => ({ ...prev, radarActive: !prev.radarActive }))
        }
        onOpenQuickIngest={() => {
          setPreselectedGroup(null);
          setIsQuickIngestOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onTriggerInstantPost={() => {
          const generated = generateRandomRadarPost(settings.monitoredKeywords);
          dispatchNewPost(generated);
        }}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* View Tab Routing */}
        {currentTab === 'feed' && (
          <div className="space-y-6">
            {/* Stats and Filter Bar */}
            <StatsBar
              totalActive={posts.length}
              expiringSoonCount={expiringSoonCount}
              highPriorityCount={highPriorityCount}
              groupsCount={FB_GROUPS_LIST.length}
              autoPurgeEnabled={settings.autoPurgeExpired}
              filter={filter}
              onFilterChange={(update) => setFilter((f) => ({ ...f, ...update }))}
              categories={categories}
            />

            {/* Keyword Alert Callout Pill Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-lg text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-slate-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Monitored Triggers:</span>
                </span>
                {settings.monitoredKeywords.slice(0, 6).map((kw) => (
                  <button
                    key={kw}
                    onClick={() => setFilter((f) => ({ ...f, search: kw }))}
                    className="text-[11px] font-mono text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-800/60 transition-colors"
                  >
                    #{kw}
                  </button>
                ))}
                {settings.monitoredKeywords.length > 6 && (
                  <span className="text-[11px] text-slate-500">
                    +{settings.monitoredKeywords.length - 6} more
                  </span>
                )}
              </div>

              <button
                onClick={() => setIsKeywordModalOpen(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
              >
                Configure Keywords
              </button>
            </div>

            {/* Posts Stream */}
            {sortedPosts.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/30 rounded-xl border border-dashed border-slate-800 space-y-3">
                <Clock className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-semibold text-slate-300">No active posts match your filter</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  New posts from your 267 monitored Facebook groups will pop up here in real time and automatically expire after 24 hours.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      const generated = generateRandomRadarPost(settings.monitoredKeywords);
                      dispatchNewPost(generated);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Trigger New Post Popup</span>
                  </button>
                  <button
                    onClick={() => setFilter({ search: '', category: 'all', status: 'all', sortBy: 'newest' })}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-xs transition-colors"
                  >
                    Clear Filter
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>
                    Showing <strong className="text-slate-200">{sortedPosts.length}</strong> posts (kept for 24h)
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    Use J / K to navigate · O to open in FB
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {sortedPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      now={now}
                      isSelected={selectedPostId === post.id}
                      onOpenFB={handleOpenFB}
                      onToggleStar={handleToggleStar}
                      onToggleRead={handleToggleRead}
                      onDismiss={handleDismissPost}
                      monitoredKeywords={settings.monitoredKeywords}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentTab === 'groups' && (
          <GroupDirectory
            visits={visits}
            onVisitGroup={handleVisitGroup}
            onQuickIngestForGroup={handleQuickIngestForGroup}
            activePostCountsByGroup={activePostCountsByGroup}
          />
        )}

        {currentTab === 'radar' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>Real-Time Group Radar & Trigger Engine</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono ${settings.radarActive ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80' : 'bg-slate-800 text-slate-400'}`}>
                    {settings.radarActive ? 'Active' : 'Paused'}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Continuously tracks new posts across your 267 SEO & marketing groups and sounds an alert whenever a trigger keyword is found.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsKeywordModalOpen(true)}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Edit Trigger Keywords ({settings.monitoredKeywords.length})</span>
                </button>
              </div>
            </div>

            {/* Keyword Radar Detail View */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-2">
                <div className="text-xs font-semibold text-slate-300">1. Instant Popups & Chimes</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every incoming post launches an on-screen toast popup with high-priority audio chime and 1-click &ldquo;Open in Facebook&rdquo; shortcut.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-2">
                <div className="text-xs font-semibold text-slate-300">2. Strict 24-Hour Expiration</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Posts remain visible for exactly 24 hours. The automated purge engine continuously sweeps expired posts to keep your stream fresh.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-2">
                <div className="text-xs font-semibold text-slate-300">3. 1-Click FB Bookmarklet</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Install our browser bookmarklet to send any post from Facebook groups directly into this dashboard with 1 click.
                </p>
              </div>
            </div>

            {/* Active Triggers list */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="text-xs font-semibold text-slate-300">
                Active Monitored Keywords ({settings.monitoredKeywords.length}):
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.monitoredKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="px-2.5 py-1 text-xs font-mono text-indigo-300 bg-indigo-950/60 border border-indigo-800/80 rounded-md"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentTab === 'archived' && (
          <ArchivedExpiredView
            archivedPosts={archivedPosts}
            onRestorePost={handleRestoreArchivedPost}
            onClearArchive={handleClearArchive}
          />
        )}
      </main>

      {/* Floating Real-Time Popup Alerts Stack */}
      <PopupAlerts
        popups={popups}
        now={now}
        onDismissPopup={(id) => setPopups((curr) => curr.filter((p) => p.id !== id))}
        onOpenFB={handleOpenFB}
      />

      {/* Bottom Speed Reader Navigation Bar */}
      <SpeedReaderBar
        hasSelection={!!selectedPostId}
        selectedPostGroup={selectedPost?.groupName}
        onOpenSelected={() => {
          if (selectedPost) handleOpenFB(selectedPost);
        }}
        onToggleStarSelected={() => {
          if (selectedPostId) handleToggleStar(selectedPostId);
        }}
        onDismissSelected={() => {
          if (selectedPostId) handleDismissPost(selectedPostId);
        }}
        onSelectNext={() => {
          if (sortedPosts.length === 0) return;
          const currentIndex = sortedPosts.findIndex((p) => p.id === selectedPostId);
          const nextIndex = currentIndex < sortedPosts.length - 1 ? currentIndex + 1 : 0;
          setSelectedPostId(sortedPosts[nextIndex].id);
        }}
        onSelectPrev={() => {
          if (sortedPosts.length === 0) return;
          const currentIndex = sortedPosts.findIndex((p) => p.id === selectedPostId);
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : sortedPosts.length - 1;
          setSelectedPostId(sortedPosts[prevIndex].id);
        }}
        onFocusSearch={() => {
          const input = document.querySelector('input[type="text"]') as HTMLInputElement;
          if (input) input.focus();
        }}
      />

      {/* Modals */}
      <QuickIngestModal
        isOpen={isQuickIngestOpen}
        onClose={() => setIsQuickIngestOpen(false)}
        onAddPost={dispatchNewPost}
        preselectedGroup={preselectedGroup}
        monitoredKeywords={settings.monitoredKeywords}
      />

      <KeywordManagerModal
        isOpen={isKeywordModalOpen}
        onClose={() => setIsKeywordModalOpen(false)}
        keywords={settings.monitoredKeywords}
        onUpdateKeywords={(kws) => setSettings((s) => ({ ...s, monitoredKeywords: kws }))}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onManualPurge={handleManualPurge}
        onResetSampleData={handleResetSampleData}
        activePosts={posts}
      />
    </div>
  );
}
