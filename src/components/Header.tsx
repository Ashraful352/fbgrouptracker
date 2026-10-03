import React from 'react';
import { ViewTab } from '../types';
import { Radio, Plus, Settings, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  activeCount: number;
  expiringSoonCount: number;
  radarActive: boolean;
  onToggleRadar: () => void;
  onOpenQuickIngest: () => void;
  onOpenSettings: () => void;
  onTriggerInstantPost: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  activeCount,
  expiringSoonCount,
  radarActive,
  onToggleRadar,
  onOpenQuickIngest,
  onOpenSettings,
  onTriggerInstantPost,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('feed');
            }}
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white hover:text-indigo-300 transition-colors"
          >
            <span className="relative flex h-3 w-3">
              {radarActive && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  radarActive ? 'bg-emerald-500' : 'bg-slate-500'
                }`}
              ></span>
            </span>
            <span>GroupPulse <span className="text-indigo-400 font-mono text-sm font-semibold">24h</span></span>
          </a>
        </div>

        {/* Zone 2: Navigation views */}
        <nav className="flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-900/90 rounded-lg border border-slate-800 text-xs font-medium">
          <button
            onClick={() => onSelectTab('feed')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'feed'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>Live Stream</span>
            <span className="font-mono text-[11px] opacity-80 tabular-nums">({activeCount})</span>
            {expiringSoonCount > 0 && (
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" title={`${expiringSoonCount} expiring soon`} />
            )}
          </button>

          <button
            onClick={() => onSelectTab('groups')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'groups'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>All Groups</span>
            <span className="font-mono text-[11px] opacity-80 tabular-nums">(267)</span>
          </button>

          <button
            onClick={() => onSelectTab('radar')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap hidden sm:flex items-center gap-1.5 ${
              currentTab === 'radar'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>Keyword Radar</span>
          </button>

          <button
            onClick={() => onSelectTab('archived')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap hidden md:flex items-center gap-1.5 ${
              currentTab === 'archived'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>Purged Today</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Simulate Trigger (for testing instant popups) */}
          <button
            onClick={onTriggerInstantPost}
            title="Simulate instant incoming post popup"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-md border border-slate-700/60 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Simulate Ping</span>
          </button>

          {/* Radar toggle */}
          <button
            onClick={onToggleRadar}
            title={radarActive ? 'Pause real-time radar' : 'Resume real-time radar'}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              radarActive
                ? 'border-emerald-600/40 text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/40'
                : 'border-slate-700 text-slate-400 bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${radarActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">{radarActive ? 'Radar Active' : 'Radar Paused'}</span>
          </button>

          {/* Add Post Button */}
          <button
            onClick={onOpenQuickIngest}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-md shadow-sm transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ Ingest Post</span>
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            title="Settings & auto-purge configuration"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
