import React from 'react';
import { GroupPost } from '../types';
import { formatTimeAgo, formatExactTime } from '../utils/time';
import { Clock, ExternalLink, RotateCcw, Trash2 } from 'lucide-react';

interface ArchivedExpiredViewProps {
  archivedPosts: GroupPost[];
  onRestorePost: (post: GroupPost) => void;
  onClearArchive: () => void;
}

export const ArchivedExpiredView: React.FC<ArchivedExpiredViewProps> = ({
  archivedPosts,
  onRestorePost,
  onClearArchive,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>24h Auto-Purged Archive</span>
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {archivedPosts.length} posts
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            As requested, posts are kept for exactly 1 day (24 hours). Once expired, they are cleanly removed from your main feed and archived here.
          </p>
        </div>

        {archivedPosts.length > 0 && (
          <button
            onClick={onClearArchive}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-white hover:bg-rose-950/60 border border-rose-900/60 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Archive</span>
          </button>
        )}
      </div>

      {archivedPosts.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-xl border border-slate-800">
          <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-300 font-medium">No expired posts yet</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Posts will automatically move here once they exceed their 24-hour retention window.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {archivedPosts.map((post) => (
            <div
              key={post.id}
              className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-300 truncate">
                    {post.groupName}
                  </span>
                  <span className="text-xs text-slate-500">by {post.authorName}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {post.content}
                </p>
                <div className="text-[11px] text-slate-500 font-mono">
                  Expired on {new Date(post.expiresAt).toLocaleDateString()} at {formatExactTime(post.expiresAt)}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onRestorePost(post)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/60 rounded-md transition-colors"
                  title="Renew for another 24 hours in the live stream"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Renew (24h)</span>
                </button>

                <a
                  href={post.postUrl || post.groupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-md transition-colors"
                  title="Open on Facebook"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
