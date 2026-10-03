import React, { useState } from 'react';
import { X, Plus, Flame, Trash2, Check } from 'lucide-react';

interface KeywordManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  keywords: string[];
  onUpdateKeywords: (keywords: string[]) => void;
}

export const KeywordManagerModal: React.FC<KeywordManagerModalProps> = ({
  isOpen,
  onClose,
  keywords,
  onUpdateKeywords,
}) => {
  const [newKeyword, setNewKeyword] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newKeyword.trim().toLowerCase();
    if (!trimmed || keywords.includes(trimmed)) return;
    onUpdateKeywords([...keywords, trimmed]);
    setNewKeyword('');
  };

  const handleRemove = (kw: string) => {
    onUpdateKeywords(keywords.filter((k) => k !== kw));
  };

  const handleResetDefaults = () => {
    onUpdateKeywords([
      'guest post',
      'backlink',
      'hiring',
      'budget',
      'dofollow',
      'urgent',
      'link building',
      'local seo',
      'niche edit',
      'client need',
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-950 text-rose-400 rounded-md border border-rose-800/80">
              <Flame className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Keyword Radar Alerts</h3>
              <p className="text-xs text-slate-400">Trigger high-priority popups and alerts when posts mention these keywords.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Add keyword form */}
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Add keyword (e.g. 'freelance writer', 'tier 1 link')..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!newKeyword.trim()}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          {/* Active Keywords list */}
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-2">
              Active Trigger Keywords ({keywords.length}):
            </div>
            <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1">
              {keywords.map((kw) => (
                <div
                  key={kw}
                  className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1 text-xs text-slate-200 hover:border-slate-700 transition-colors"
                >
                  <span className="font-mono text-rose-400">#</span>
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(kw)}
                    className="text-slate-500 hover:text-rose-400 transition-colors ml-1"
                    title={`Remove ${kw}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-slate-400 hover:text-slate-200 underline"
            >
              Reset to SEO defaults
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-md font-semibold transition-colors flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
