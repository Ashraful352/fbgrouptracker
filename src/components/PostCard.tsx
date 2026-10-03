import React, { useState } from 'react';
import { GroupPost } from '../types';
import { getTimeRemaining, formatTimeAgo } from '../utils/time';
import { ExternalLink, Star, Check, Copy, Trash2, Clock, Flame } from 'lucide-react';

interface PostCardProps {
  post: GroupPost;
  now: number;
  isSelected?: boolean;
  onOpenFB: (post: GroupPost) => void;
  onToggleStar: (postId: string) => void;
  onToggleRead: (postId: string) => void;
  onDismiss: (postId: string) => void;
  monitoredKeywords: string[];
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  now,
  isSelected = false,
  onOpenFB,
  onToggleStar,
  onToggleRead,
  onDismiss,
  monitoredKeywords,
}) => {
  const [copied, setCopied] = useState(false);
  const remaining = getTimeRemaining(post.expiresAt, now);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `${post.groupName} - Post by ${post.authorName}:\n${post.content}\n\nLink: ${post.postUrl || post.groupUrl}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Status colors for countdown
  let statusBadgeStyle = 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
  let barColor = 'bg-emerald-500';

  if (remaining.status === 'expiring_soon') {
    statusBadgeStyle = 'text-rose-400 bg-rose-950/60 border-rose-800/60 animate-pulse';
    barColor = 'bg-rose-500';
  } else if (remaining.status === 'halfway') {
    statusBadgeStyle = 'text-amber-400 bg-amber-950/60 border-amber-800/60';
    barColor = 'bg-amber-500';
  } else if (remaining.status === 'expired') {
    statusBadgeStyle = 'text-slate-500 bg-slate-900 border-slate-800';
    barColor = 'bg-slate-600';
  }

  // Highlight keywords helper
  const renderHighlightedContent = (content: string) => {
    if (!monitoredKeywords.length) return content;
    // Regex matching any monitored keyword case-insensitively
    const escapedKeywords = monitoredKeywords
      .filter(k => k.trim().length > 1)
      .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');

    if (!escapedKeywords) return content;

    const regex = new RegExp(`(${escapedKeywords})`, 'gi');
    const parts = content.split(regex);

    return parts.map((part, i) => {
      const isMatch = monitoredKeywords.some(kw => kw.toLowerCase() === part.toLowerCase());
      if (isMatch) {
        return (
          <mark
            key={i}
            className="bg-amber-500/20 text-amber-200 font-semibold px-1 rounded-sm border-b border-amber-500/60"
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  return (
    <article
      onClick={() => onToggleRead(post.id)}
      className={`group relative rounded-xl border transition-all duration-200 p-4 sm:p-5 ${
        isSelected
          ? 'ring-2 ring-indigo-500 border-indigo-500/50 bg-slate-900'
          : post.isRead
          ? 'bg-slate-900/40 border-slate-800/60 opacity-90 hover:opacity-100 hover:bg-slate-900/70 hover:border-slate-700/60'
          : 'bg-slate-900/90 border-slate-700/70 shadow-sm hover:border-slate-600 hover:bg-slate-900'
      }`}
    >
      {/* 24-Hour Expiration Progress Bar at top edge of card */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800 rounded-t-xl overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${barColor}`}
          style={{ width: `${remaining.percentageRemaining}%` }}
        />
      </div>

      <div className="flex flex-col gap-3">
        {/* Header row: Group Title + Unboxed Metadata + Expiration Badge */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <a
                href={post.groupUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenFB(post);
                }}
                className="text-sm font-semibold text-slate-100 hover:text-indigo-400 transition-colors flex items-center gap-1.5 truncate max-w-md"
                title={`Open group: ${post.groupName}`}
              >
                <span>{post.groupName}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 shrink-0" />
              </a>

              {post.priority === 'high' && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-300 bg-rose-950/70 border border-rose-800/80 px-1.5 py-0.5 rounded shrink-0">
                  <Flame className="w-3 h-3 text-rose-400" />
                  <span>Keyword Alert</span>
                </span>
              )}

              {post.isStarred && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-700/70 px-1.5 py-0.5 rounded shrink-0">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>Pinned (Kept)</span>
                </span>
              )}
            </div>

            {/* Zero-Pill Unboxed Clean Metadata with '·' separator */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
              <span className="font-medium text-slate-300">{post.authorName}</span>
              <span aria-hidden="true">·</span>
              <span>{post.tags?.[0] || 'SEO'}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{formatTimeAgo(post.createdAt, now)}</span>
            </div>
          </div>

          {/* 24-Hour Countdown Clock */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono tabular-nums shrink-0 ${statusBadgeStyle}`}
            title={`Post added: ${new Date(post.createdAt).toLocaleString()}. Automatically deleted at: ${new Date(post.expiresAt).toLocaleString()}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="font-medium">
              {remaining.isExpired ? 'Expired' : `Expires in ${remaining.formatted}`}
            </span>
          </div>
        </div>

        {/* Post Content */}
        <p className="text-sm text-slate-200 leading-relaxed break-words whitespace-pre-wrap selection:bg-indigo-700">
          {renderHighlightedContent(post.content)}
        </p>

        {/* Matched Keywords Tags (if any) */}
        {post.matchedKeywords && post.matchedKeywords.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 pt-1">
            <span className="text-[11px] text-slate-400">Matched triggers:</span>
            {post.matchedKeywords.map((kw) => (
              <span
                key={kw}
                className="text-[11px] font-mono font-medium text-indigo-300 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/60"
              >
                #{kw}
              </span>
            ))}
          </div>
        )}

        {/* Action Toolbar */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 mt-1">
          {/* Primary Action: Direct Facebook opener */}
          <div className="flex items-center gap-2">
            <a
              href={post.postUrl || post.groupUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                onOpenFB(post);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-md transition-colors shadow-xs"
            >
              <span>Open in Facebook</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-md transition-colors"
              title="Copy post content & link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(post.id);
              }}
              title={post.isStarred ? 'Unstar (subject to 24h auto-purge)' : 'Star (pin & protect from auto-purge)'}
              className={`p-1.5 rounded-md transition-colors ${
                post.isStarred
                  ? 'text-amber-400 bg-amber-950/60 hover:bg-amber-900/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Star className={`w-4 h-4 ${post.isStarred ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(post.id);
              }}
              title="Remove from dashboard"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
