import React from 'react';
import { FilterState } from '../types';
import { Flame, Clock, Radio, Users, CheckCircle2, Search, SlidersHorizontal } from 'lucide-react';

interface StatsBarProps {
  totalActive: number;
  expiringSoonCount: number;
  highPriorityCount: number;
  groupsCount: number;
  autoPurgeEnabled: boolean;
  filter: FilterState;
  onFilterChange: (update: Partial<FilterState>) => void;
  categories: string[];
}

export const StatsBar: React.FC<StatsBarProps> = ({
  totalActive,
  expiringSoonCount,
  highPriorityCount,
  groupsCount,
  autoPurgeEnabled,
  filter,
  onFilterChange,
  categories,
}) => {
  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Active Stream</span>
            <Radio className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            {totalActive}
            <span className="text-xs font-normal text-slate-400 ml-1.5">&lt; 24h old</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Expiring Soon</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-300 tabular-nums">
            {expiringSoonCount}
            <span className="text-xs font-normal text-slate-400 ml-1.5">&lt; 2h left</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Keyword Alerts</span>
            <Flame className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-300 tabular-nums">
            {highPriorityCount}
            <span className="text-xs font-normal text-slate-400 ml-1.5">high intent</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Covered Groups</span>
            <Users className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-300 tabular-nums">
            {groupsCount}
            <span className="text-xs font-normal text-slate-400 ml-1.5">SEO & DM</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <CheckCircle2 className={`w-3.5 h-3.5 ${autoPurgeEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>24h Auto-Purge</span>
          </div>
          <div className="text-xs font-medium text-slate-300">
            {autoPurgeEnabled ? 'Active · 1-day retention' : 'Paused (posts kept)'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filter.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search keywords, posts, or groups (Press / to focus)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          {filter.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={filter.category}
              onChange={(e) => onFilterChange({ category: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Categories (267 groups)</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-md border border-slate-800">
            <button
              onClick={() => onFilterChange({ status: 'all' })}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                filter.status === 'all'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onFilterChange({ status: 'high_priority' })}
              className={`px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                filter.status === 'high_priority'
                  ? 'bg-rose-950 text-rose-300 font-medium border border-rose-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Alerts</span>
              {highPriorityCount > 0 && (
                <span className="font-mono text-[10px] tabular-nums">({highPriorityCount})</span>
              )}
            </button>
            <button
              onClick={() => onFilterChange({ status: 'expiring_soon' })}
              className={`px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                filter.status === 'expiring_soon'
                  ? 'bg-amber-950 text-amber-300 font-medium border border-amber-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Expiring</span>
              {expiringSoonCount > 0 && (
                <span className="font-mono text-[10px] tabular-nums">({expiringSoonCount})</span>
              )}
            </button>
            <button
              onClick={() => onFilterChange({ status: 'starred' })}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                filter.status === 'starred'
                  ? 'bg-amber-500/20 text-amber-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Starred
            </button>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1 text-xs text-slate-400 ml-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <select
              value={filter.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
              className="bg-transparent border-0 text-xs text-slate-300 focus:outline-none cursor-pointer pr-2"
            >
              <option value="newest" className="bg-slate-900">Newest first</option>
              <option value="expiring_soon" className="bg-slate-900">Expiring soonest</option>
              <option value="priority" className="bg-slate-900">Priority alerts first</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
