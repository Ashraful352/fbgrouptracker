import { GroupPost, AppSettings } from '../types';
import { generateInitialPosts, INITIAL_KEYWORDS } from './sampleData';

const STORAGE_KEYS = {
  POSTS: 'grouppulse_posts_v1',
  ARCHIVED_EXPIRED: 'grouppulse_archived_expired_v1',
  SETTINGS: 'grouppulse_settings_v1',
  GROUP_VISITS: 'grouppulse_group_visits_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  soundAlerts: true,
  desktopNotifications: false,
  autoPurgeExpired: true, // Auto-remove from dashboard after 1 day (24 hours) as requested
  radarActive: true,      // Active monitoring
  radarIntervalSec: 25,
  monitoredKeywords: INITIAL_KEYWORDS,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function loadPosts(): GroupPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (raw) {
      const parsed: GroupPost[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  // First time initialization
  const initial = generateInitialPosts();
  savePosts(initial);
  return initial;
}

export function savePosts(posts: GroupPost[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  } catch {
    // ignore
  }
}

export function loadArchivedExpired(): GroupPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ARCHIVED_EXPIRED);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveArchivedExpired(archived: GroupPost[]): void {
  try {
    // Keep at most 100 historical expired posts
    const trimmed = archived.slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.ARCHIVED_EXPIRED, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

export function loadGroupVisits(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GROUP_VISITS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return {};
}

export function recordGroupVisit(groupId: string): Record<string, number> {
  const visits = loadGroupVisits();
  visits[groupId] = Date.now();
  try {
    localStorage.setItem(STORAGE_KEYS.GROUP_VISITS, JSON.stringify(visits));
  } catch {
    // ignore
  }
  return visits;
}

/**
 * Purges expired posts (>24 hours).
 * Returns { remainingPosts, purgedCount, newlyPurgedPosts }
 */
export function purgeExpiredPosts(
  posts: GroupPost[],
  keepStarred: boolean = true
): { remaining: GroupPost[]; purged: GroupPost[] } {
  const now = Date.now();
  const remaining: GroupPost[] = [];
  const purged: GroupPost[] = [];

  for (const post of posts) {
    const isExpired = post.expiresAt <= now;
    if (isExpired) {
      if (keepStarred && post.isStarred) {
        // Starred posts explicitly preserved by user
        remaining.push(post);
      } else {
        purged.push(post);
      }
    } else {
      remaining.push(post);
    }
  }

  if (purged.length > 0) {
    const existingArchived = loadArchivedExpired();
    saveArchivedExpired([...purged, ...existingArchived]);
    savePosts(remaining);
  }

  return { remaining, purged };
}
