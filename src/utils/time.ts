/**
 * Time and Expiration Utilities for 24-Hour Retention Lifecycle.
 */

export const RETENTION_PERIOD_MS = 24 * 60 * 60 * 1000; // Exactly 24 hours (86,400,000 ms)

export interface TimeRemainingInfo {
  milliseconds: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  isExpired: boolean;
  status: 'fresh' | 'halfway' | 'expiring_soon' | 'expired';
  percentageRemaining: number;
}

export function getTimeRemaining(expiresAt: number, now: number = Date.now()): TimeRemainingInfo {
  const diff = expiresAt - now;

  if (diff <= 0) {
    return {
      milliseconds: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: 'Expired',
      isExpired: true,
      status: 'expired',
      percentageRemaining: 0,
    };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  let formatted = '';
  if (hours > 0) {
    formatted = `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    formatted = `${minutes}m ${seconds}s`;
  } else {
    formatted = `${seconds}s`;
  }

  // Calculate percentage remaining (0 to 100)
  const percentageRemaining = Math.max(0, Math.min(100, (diff / RETENTION_PERIOD_MS) * 100));

  let status: 'fresh' | 'halfway' | 'expiring_soon' | 'expired' = 'fresh';
  if (diff <= 2 * 60 * 60 * 1000) {
    status = 'expiring_soon'; // under 2 hours
  } else if (diff <= 12 * 60 * 60 * 1000) {
    status = 'halfway'; // between 2h and 12h
  }

  return {
    milliseconds: diff,
    hours,
    minutes,
    seconds,
    formatted,
    isExpired: false,
    status,
    percentageRemaining,
  };
}

export function formatTimeAgo(timestamp: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - timestamp);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 45) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return '1d ago';
}

export function formatExactTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}
