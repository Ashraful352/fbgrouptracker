export interface FBGroup {
  id: string;
  slug: string;
  name: string;
  url: string;
  isNumeric: boolean;
  category: string;
  checkedAt?: number | null;
}

export interface GroupPost {
  id: string;
  groupId: string;
  groupName: string;
  groupUrl: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  postUrl: string;
  createdAt: number; // timestamp in ms
  expiresAt: number; // timestamp in ms (createdAt + 24 hours)
  isStarred?: boolean;
  isRead?: boolean;
  tags?: string[];
  matchedKeywords?: string[];
  priority?: 'high' | 'normal';
}

export type ViewTab = 'feed' | 'groups' | 'radar' | 'archived';

export interface FilterState {
  search: string;
  category: string;
  status: 'all' | 'unread' | 'high_priority' | 'starred' | 'expiring_soon';
  sortBy: 'newest' | 'expiring_soon' | 'priority';
}

export interface AppSettings {
  soundAlerts: boolean;
  desktopNotifications: boolean;
  autoPurgeExpired: boolean;
  radarActive: boolean;
  radarIntervalSec: number;
  monitoredKeywords: string[];
}
