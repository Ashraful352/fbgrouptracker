import React from 'react';
import { GroupPost } from '../types';
import { ExternalLink, X, Flame, Clock } from 'lucide-react';
import { getTimeRemaining } from '../utils/time';

export interface ActivePopupNotification {
  id: string;
  post: GroupPost;
  receivedAt: number;
}

interface PopupAlertsProps {
  popups: ActivePopupNotification[];
  now: number;
  onDismissPopup: (popupId: string) => void;
  onOpenFB: (post: GroupPost) => void;
}

export const PopupAlerts: React.FC<PopupAlertsProps> = ({
  popups,
  now,
  onDismissPopup,
  onOpenFB,
}) => {
  if (popups.length === 0) return null;

  return (
    <aside
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none"
    >
      {popups.map(({ id, post }) => {
        const remaining = getTimeRemaining(post.expiresAt, now);

        return (
          <div
            key={id}
            className="pointer-events-auto bg-slate-900/95 border-2 border-indigo-500/80 rounded-xl p-4 shadow-2xl backdrop-blur-md transform transition-all duration-300 animate-in slide-in-from-bottom-5"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  ⚡ New Group Post Alert
                </span>
              </div>

              <button
                onClick={() => onDismissPopup(id)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
                title="Dismiss popup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Group & Author info */}
            <div className="mb-2">
              <div className="text-sm font-semibold text-white truncate" title={post.groupName}>
                {post.groupName}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="text-slate-300 font-medium">{post.authorName}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-indigo-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 inline" />
                  Kept for 24h ({remaining.formatted} left)
                </span>
              </div>
            </div>

            {/* Keyword tag if matched */}
            {post.priority === 'high' && (
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-300 bg-rose-950/80 border border-rose-800/80 px-2 py-0.5 rounded mb-2">
                <Flame className="w-3 h-3 text-rose-400" />
                <span>Keyword Match Alert</span>
              </div>
            )}

            {/* Content snippet */}
            <p className="text-xs text-slate-200 line-clamp-3 mb-3 leading-relaxed bg-slate-950/60 p-2.5 rounded-md border border-slate-800/80">
              {post.content}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-slate-500 font-mono">
                Auto-removes in 24 hours
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDismissPopup(id)}
                  className="px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                >
                  Dismiss
                </button>

                <a
                  href={post.postUrl || post.groupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    onOpenFB(post);
                    onDismissPopup(id);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors shadow-sm"
                >
                  <span>Open on Facebook</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </aside>
  );
};
