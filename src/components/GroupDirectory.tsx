import React, { useState, useMemo } from 'react';
import { FBGroup } from '../types';
import { FB_GROUPS_LIST } from '../data/groupList';
import { Search, ExternalLink, PlusCircle, CheckCircle2, Clock, Play } from 'lucide-react';
import { formatTimeAgo } from '../utils/time';

interface GroupDirectoryProps {
  visits: Record<string, number>;
  onVisitGroup: (groupId: string, url: string) => void;
  onQuickIngestForGroup: (group: FBGroup) => void;
  activePostCountsByGroup: Record<string, number>;
}

export const GroupDirectory: React.FC<GroupDirectoryProps> = ({
  visits,
  onVisitGroup,
  onQuickIngestForGroup,
  activePostCountsByGroup,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyUnvisited, setShowOnlyUnvisited] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    FB_GROUPS_LIST.forEach((g) => set.add(g.category));
    return Array.from(set).sort();
  }, []);

  const filteredGroups = useMemo(() => {
    return FB_GROUPS_LIST.filter((group) => {
      if (selectedCategory !== 'all' && group.category !== selectedCategory) {
        return false;
      }
      if (showOnlyUnvisited && visits[group.id]) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          group.name.toLowerCase().includes(q) ||
          group.slug.toLowerCase().includes(q) ||
          group.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, selectedCategory, showOnlyUnvisited, visits]);

  // "Open Next Unchecked Group" helper
  const nextUncheckedGroup = useMemo(() => {
    return FB_GROUPS_LIST.find((g) => !visits[g.id]);
  }, [visits]);

  const handleOpenNext = () => {
    if (nextUncheckedGroup) {
      onVisitGroup(nextUncheckedGroup.id, nextUncheckedGroup.url);
      window.open(nextUncheckedGroup.url, '_blank', 'noopener,noreferrer');
    }
  };

  const checkedCount = Object.keys(visits).length;

  return (
    <div className="space-y-4">
      {/* Header and Speed Checker Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>Facebook Group Radar Directory</span>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded">
              267 Groups Configured
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Check your SEO, Guest Post, and Job communities rapidly. Checked groups show recent visit timestamps.
          </p>
        </div>

        {/* Speed Checker button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-xs text-right hidden sm:block">
            <div className="text-slate-400">Progress Today</div>
            <div className="font-mono text-emerald-400 font-semibold tabular-nums">
              {checkedCount} / {FB_GROUPS_LIST.length} visited
            </div>
          </div>

          <button
            onClick={handleOpenNext}
            disabled={!nextUncheckedGroup}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all ${
              nextUncheckedGroup
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Open Next Unchecked Group</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search across 267 group names, numeric IDs, or categories..."
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Categories ({FB_GROUPS_LIST.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowOnlyUnvisited(!showOnlyUnvisited)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              showOnlyUnvisited
                ? 'bg-indigo-950/60 border-indigo-700/60 text-indigo-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {showOnlyUnvisited ? 'Showing: Unvisited Only' : 'Show Unvisited Only'}
          </button>
        </div>
      </div>

      {/* Groups Grid / High-Density List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredGroups.map((group) => {
          const lastVisited = visits[group.id];
          const activePostCount = activePostCountsByGroup[group.id] || 0;

          return (
            <div
              key={group.id}
              className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-lg p-3.5 flex flex-col justify-between gap-2.5 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={group.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onVisitGroup(group.id, group.url)}
                    className="text-sm font-semibold text-slate-100 hover:text-indigo-400 transition-colors flex items-center gap-1.5 line-clamp-1"
                    title={group.name}
                  >
                    <span>{group.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 shrink-0" />
                  </a>

                  {activePostCount > 0 && (
                    <span className="font-mono text-[10px] font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-800/80 px-1.5 py-0.5 rounded shrink-0">
                      {activePostCount} active
                    </span>
                  )}
                </div>

                {/* Zero-Pill Unboxed Clean Subtitle */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <span>{group.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[11px] text-slate-500 truncate max-w-[140px]">
                    /{group.slug}
                  </span>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/70 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] tabular-nums">
                  {lastVisited ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-emerald-400/90">Checked {formatTimeAgo(lastVisited)}</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-slate-500">Not checked today</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onQuickIngestForGroup(group)}
                    title="Add post from this group"
                    className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>

                  <a
                    href={group.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onVisitGroup(group.id, group.url)}
                    className="px-2.5 py-1 text-[11px] font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                  >
                    Open FB
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-slate-800">
          <p className="text-sm text-slate-400">No groups match your current filter.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
              setShowOnlyUnvisited(false);
            }}
            className="mt-3 text-xs text-indigo-400 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};
