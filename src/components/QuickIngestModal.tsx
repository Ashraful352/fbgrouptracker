import React, { useState, useEffect } from 'react';
import { FBGroup, GroupPost } from '../types';
import { FB_GROUPS_LIST } from '../data/groupList';
import { RETENTION_PERIOD_MS } from '../utils/time';
import { X, Sparkles, Bookmark, Copy, Check, Clock } from 'lucide-react';

interface QuickIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPost: (post: GroupPost) => void;
  preselectedGroup?: FBGroup | null;
  monitoredKeywords: string[];
}

export const QuickIngestModal: React.FC<QuickIngestModalProps> = ({
  isOpen,
  onClose,
  onAddPost,
  preselectedGroup,
  monitoredKeywords,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    preselectedGroup ? preselectedGroup.id : FB_GROUPS_LIST[0].id
  );
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);
  const [showBookmarkletHelp, setShowBookmarkletHelp] = useState(false);

  useEffect(() => {
    if (preselectedGroup) {
      setSelectedGroupId(preselectedGroup.id);
    }
  }, [preselectedGroup]);

  if (!isOpen) return null;

  const handleUrlChange = (url: string) => {
    setPostUrl(url);
    // Try to auto-match group from pasted URL
    const match = FB_GROUPS_LIST.find((g) => url.toLowerCase().includes(g.slug.toLowerCase()));
    if (match) {
      setSelectedGroupId(match.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const group = FB_GROUPS_LIST.find((g) => g.id === selectedGroupId) || FB_GROUPS_LIST[0];
    const now = Date.now();

    const matchedKeywords = monitoredKeywords.filter((kw) =>
      content.toLowerCase().includes(kw.toLowerCase())
    );

    const newPost: GroupPost = {
      id: `post_manual_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      groupId: group.id,
      groupName: group.name,
      groupUrl: group.url,
      authorName: authorName.trim() || 'Facebook Member',
      content: content.trim(),
      postUrl: postUrl.trim() || `${group.url}/posts/${Date.now()}/`,
      createdAt: now,
      expiresAt: now + RETENTION_PERIOD_MS,
      isStarred: false,
      isRead: false,
      tags: [group.category],
      matchedKeywords,
      priority: matchedKeywords.length > 0 ? 'high' : 'normal',
    };

    onAddPost(newPost);
    // Reset and close
    setContent('');
    setAuthorName('');
    setPostUrl('');
    onClose();
  };

  // 1-Click Bookmarklet javascript snippet
  const bookmarkletCode = `javascript:(function(){const title=document.title;const text=window.getSelection().toString()||prompt('Facebook Post Text:');if(!text)return;const url=window.location.href;const appUrl='${typeof window !== 'undefined' ? window.location.origin : ''}';window.open(appUrl+'?ingest='+encodeURIComponent(JSON.stringify({text,url,title})),'_blank');})();`;

  const copyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-950 text-indigo-400 rounded-md border border-indigo-800/80">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Ingest New Group Post</h3>
              <p className="text-xs text-slate-400">Post will appear immediately in popup and auto-purge in 24 hours.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Group selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Facebook Group ({FB_GROUPS_LIST.length} Available)
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {FB_GROUPS_LIST.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} — {g.category} (/{g.slug})
                </option>
              ))}
            </select>
          </div>

          {/* Author Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Author / Poster Name (Optional)
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. John Doe, Tanvir Hasan..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Post Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Post Content / Ingestion Text <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the Facebook post text here (e.g. 'Looking for guest post in Tech niche with DA 50+ budget $50...')"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          {/* Post or Group URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Facebook Post or Group URL (Optional)
            </label>
            <input
              type="url"
              value={postUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://www.facebook.com/groups/.../posts/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* 24-Hour Notice */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex items-center gap-2.5 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              This post will be kept for <strong className="text-slate-200">24 hours</strong>. At 24h, the auto-purge engine will remove it from the active dashboard.
            </span>
          </div>

          {/* Submit and Bookmarklet toggle */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setShowBookmarkletHelp(!showBookmarkletHelp)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{showBookmarkletHelp ? 'Hide Bookmarklet tool' : 'Use 1-Click FB Bookmarklet'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!content.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
              >
                + Add Post (24h Timer)
              </button>
            </div>
          </div>

          {/* Bookmarklet instructions */}
          {showBookmarkletHelp && (
            <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-2">
              <div className="font-semibold text-slate-200">
                1-Click Browser Bookmarklet (Fastest FB Ingest):
              </div>
              <p className="text-slate-400">
                Copy this code and create a browser bookmark named <code className="text-indigo-300 font-mono">Send to GroupPulse</code>. When reading any Facebook group post, click your bookmark to send the post directly here!
              </p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={bookmarkletCode}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-[11px] font-mono text-slate-400 truncate"
                />
                <button
                  type="button"
                  onClick={copyBookmarklet}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1 shrink-0"
                >
                  {copiedBookmarklet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedBookmarklet ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
