import React from 'react';
import { AppSettings, GroupPost } from '../types';
import { X, Volume2, VolumeX, Bell, BellOff, Clock, ShieldCheck, Download, Trash2, RotateCcw } from 'lucide-react';
import { playNotificationSound } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onManualPurge: () => void;
  onResetSampleData: () => void;
  activePosts: GroupPost[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onManualPurge,
  onResetSampleData,
  activePosts,
}) => {
  if (!isOpen) return null;

  const toggleSound = () => {
    const next = !settings.soundAlerts;
    onUpdateSettings({ ...settings, soundAlerts: next });
    if (next) {
      playNotificationSound('post');
    }
  };

  const toggleDesktopNotifications = async () => {
    if (!settings.desktopNotifications) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          onUpdateSettings({ ...settings, desktopNotifications: true });
        } else {
          alert('Notification permission was denied in your browser settings.');
        }
      }
    } else {
      onUpdateSettings({ ...settings, desktopNotifications: false });
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activePosts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `grouppulse_posts_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ['Group Name', 'Author', 'Content', 'Post URL', 'Created At', 'Expires At', 'Keywords'];
    const rows = activePosts.map((p) => [
      `"${p.groupName.replace(/"/g, '""')}"`,
      `"${p.authorName.replace(/"/g, '""')}"`,
      `"${p.content.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${p.postUrl || p.groupUrl}"`,
      new Date(p.createdAt).toISOString(),
      new Date(p.expiresAt).toISOString(),
      `"${(p.matchedKeywords || []).join(', ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `grouppulse_posts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Dashboard & 24h Retention Settings</h3>
            <p className="text-xs text-slate-400">Configure auto-removal, radar speed, and alert audio.</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs">
          {/* 24-Hour Expiration Section */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <Clock className="w-4 h-4" />
              <span>24-Hour Expiration & Purging</span>
            </div>

            <label className="flex items-start justify-between gap-3 cursor-pointer">
              <div className="space-y-0.5">
                <div className="text-slate-200 font-medium">Automatic 24-Hour Expiration Removal</div>
                <div className="text-slate-400">
                  Posts older than 24 hours are automatically removed from your dashboard so you only see fresh activity.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoPurgeExpired}
                onChange={(e) => onUpdateSettings({ ...settings, autoPurgeExpired: e.target.checked })}
                className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
              />
            </label>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Run manual expiration sweep now:</span>
              <button
                type="button"
                onClick={onManualPurge}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors"
              >
                Purge Expired Now
              </button>
            </div>
          </div>

          {/* Sound & Notifications */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Popup & Sound Alerts</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-slate-200 font-medium">Audio Chime on New Post Popup</div>
                <div className="text-slate-400">Plays a subtle pleasant chime when a post arrives</div>
              </div>
              <button
                onClick={toggleSound}
                className={`p-2 rounded-md transition-colors ${
                  settings.soundAlerts
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
              >
                {settings.soundAlerts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              <div className="space-y-0.5">
                <div className="text-slate-200 font-medium">Desktop Browser Notifications</div>
                <div className="text-slate-400">Get system popups even when tab is in background</div>
              </div>
              <button
                onClick={toggleDesktopNotifications}
                className={`p-2 rounded-md transition-colors ${
                  settings.desktopNotifications
                    ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
              >
                {settings.desktopNotifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Radar Speed */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="text-slate-200 font-semibold">Background Radar Stream Interval</div>
            <div className="text-slate-400">Control how frequently new posts are checked and popped up:</div>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[15, 25, 45, 60].map((sec) => (
                <button
                  key={sec}
                  onClick={() => onUpdateSettings({ ...settings, radarIntervalSec: sec })}
                  className={`py-1.5 px-2 rounded text-center border font-mono ${
                    settings.radarIntervalSec === sec
                      ? 'bg-indigo-600 border-indigo-500 text-white font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Export / Backup */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="text-slate-200 font-semibold">Export Active Posts Data</div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV Spreadsheet</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* Danger zone / Reset */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={onResetSampleData}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Sample Feeds</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors"
            >
              Save & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
