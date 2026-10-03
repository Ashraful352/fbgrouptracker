import React from 'react';
import { ExternalLink, Star, Trash2, Search, ArrowUp, ArrowDown } from 'lucide-react';

interface SpeedReaderBarProps {
  hasSelection: boolean;
  selectedPostGroup?: string;
  onOpenSelected: () => void;
  onToggleStarSelected: () => void;
  onDismissSelected: () => void;
  onSelectNext: () => void;
  onSelectPrev: () => void;
  onFocusSearch: () => void;
}

export const SpeedReaderBar: React.FC<SpeedReaderBarProps> = ({
  hasSelection,
  selectedPostGroup,
  onOpenSelected,
  onToggleStarSelected,
  onDismissSelected,
  onSelectNext,
  onSelectPrev,
  onFocusSearch,
}) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-md px-4 py-2 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Selection Indicator */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">Speed Nav:</span>
          {hasSelection && selectedPostGroup ? (
            <span className="text-indigo-400 truncate max-w-xs font-medium">
              Selected: {selectedPostGroup}
            </span>
          ) : (
            <span className="text-slate-500">Click any post or press J / K to select</span>
          )}
        </div>

        {/* Quick Keyboard Actions */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto py-0.5">
          <button
            onClick={onSelectPrev}
            className="flex items-center gap-1 hover:text-slate-200 transition-colors"
          >
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">K</kbd>
            <span className="hidden sm:inline">Prev</span>
            <ArrowUp className="w-3 h-3 sm:hidden" />
          </button>

          <button
            onClick={onSelectNext}
            className="flex items-center gap-1 hover:text-slate-200 transition-colors"
          >
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">J</kbd>
            <span className="hidden sm:inline">Next</span>
            <ArrowDown className="w-3 h-3 sm:hidden" />
          </button>

          <button
            onClick={onOpenSelected}
            disabled={!hasSelection}
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 disabled:opacity-40 transition-colors font-medium"
          >
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">O</kbd>
            <ExternalLink className="w-3 h-3 inline" />
            <span>Open FB</span>
          </button>

          <button
            onClick={onToggleStarSelected}
            disabled={!hasSelection}
            className="flex items-center gap-1 hover:text-amber-300 disabled:opacity-40 transition-colors"
          >
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">S</kbd>
            <Star className="w-3 h-3 inline" />
            <span className="hidden sm:inline">Pin</span>
          </button>

          <button
            onClick={onDismissSelected}
            disabled={!hasSelection}
            className="flex items-center gap-1 hover:text-rose-400 disabled:opacity-40 transition-colors"
          >
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">X</kbd>
            <Trash2 className="w-3 h-3 inline" />
            <span className="hidden sm:inline">Dismiss</span>
          </button>

          <button
            onClick={onFocusSearch}
            className="flex items-center gap-1 hover:text-slate-200 transition-colors hidden md:flex"
          >
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">/</kbd>
            <Search className="w-3 h-3 inline" />
            <span>Search</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
