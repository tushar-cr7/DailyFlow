import React, { useState, useEffect } from 'react';
import type { UserSettings, UpdateUserSettingsDTO } from '../../shared/types/settings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated?: (settings: UserSettings) => void;
}

type TabType = 'general' | 'productivity' | 'appearance' | 'notifications' | 'engagement' | 'data';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsUpdated,
}) => {
  const api = window.dailyflow;
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Test Notification state
  const [testResult, setTestResult] = useState<string | null>(null);

  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetInput, setResetInput] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      void fetchSettings();
    }
  }, [isOpen]);

  async function fetchSettings() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.getSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      } else {
        setErrorMsg(res.error || 'Failed to load settings');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error fetching settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(dto: UpdateUserSettingsDTO) {
    if (!settings) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.updateSettings(dto);
      if (res.success && res.data) {
        setSettings(res.data);
        if (onSettingsUpdated) {
          onSettingsUpdated(res.data);
        }
      } else {
        setErrorMsg(res.error || 'Failed to update settings');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error updating settings');
    }
  }

  async function handleSendTestNotification() {
    setTestResult(null);
    try {
      const res = await api.testNotification();
      if (res.success && res.data?.sent) {
        setTestResult('✓ Test notification sent!');
      } else {
        setTestResult('⚠️ Test skipped (notifications disabled or already sent).');
      }
    } catch (err) {
      setTestResult(err instanceof Error ? err.message : 'Failed to send test notification');
    }
  }

  async function handleExport() {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await api.exportUserData();
      if (res.success && res.data?.exported) {
        setSuccessMsg(`✓ Backup saved to ${res.data.filePath || 'file'}`);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Export failed');
    }
  }

  async function handleImport() {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await api.importUserData();
      if (res.success && res.data?.imported) {
        setSuccessMsg(`✓ Successfully restored backup (${res.data.taskCount} tasks restored)!`);
        await fetchSettings();
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Import failed');
    }
  }

  async function handleReset() {
    setResetError(null);
    if (resetInput !== 'RESET') {
      setResetError('You must type RESET exactly to confirm');
      return;
    }

    try {
      const res = await api.resetAppData(resetInput);
      if (res.success && res.data?.reset) {
        setShowResetConfirm(false);
        setResetInput('');
        setSuccessMsg('✓ Application data has been completely reset.');
        await fetchSettings();
      } else {
        setResetError(res.error || 'Reset failed');
      }
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Reset failed');
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center glass-modal p-4 animate-card-enter">
      <div className="w-full max-w-2xl obsidian-card border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] accent-glow-indigo">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⚙️</span>
            <h2 className="text-lg font-bold text-white tracking-tight">Settings & Personalization</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/80 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-4 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-3 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            👤 General
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('productivity')}
            className={`px-3 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'productivity'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ⏱️ Productivity
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`px-3 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'appearance'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🎨 Appearance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🔔 Notifications
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('engagement')}
            className={`px-3 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'engagement'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🏆 Engagement
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={`px-3 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'data'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            💾 Data & Storage
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-medium">
              {successMsg}
            </div>
          )}

          {loading || !settings ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading settings...</div>
          ) : (
            <>
              {/* TAB 1: GENERAL */}
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">User Display Name</div>
                      <div className="text-[11px] text-slate-400">Personalize greetings across DailyFlow</div>
                    </div>
                    <input
                      type="text"
                      value={settings.general.userName}
                      onChange={(e) =>
                        handleUpdate({ general: { userName: e.target.value } })
                      }
                      className="bg-slate-800 text-slate-200 text-xs rounded px-3 py-1.5 border border-slate-700 focus:outline-none w-44"
                      maxLength={50}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Start of Week</div>
                      <div className="text-[11px] text-slate-400">First day for weekly schedules and calendars</div>
                    </div>
                    <select
                      value={settings.general.startOfWeek}
                      onChange={(e) =>
                        handleUpdate({
                          general: { startOfWeek: e.target.value as 'monday' | 'sunday' },
                        })
                      }
                      className="bg-slate-800 text-slate-200 text-xs rounded px-3 py-1.5 border border-slate-700 focus:outline-none"
                    >
                      <option value="monday">Monday</option>
                      <option value="sunday">Sunday</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Time Format</div>
                      <div className="text-[11px] text-slate-400">Choose between 12-hour (AM/PM) or 24-hour display</div>
                    </div>
                    <select
                      value={settings.general.timeFormat}
                      onChange={(e) =>
                        handleUpdate({
                          general: { timeFormat: e.target.value as '12h' | '24h' },
                        })
                      }
                      className="bg-slate-800 text-slate-200 text-xs rounded px-3 py-1.5 border border-slate-700 focus:outline-none"
                    >
                      <option value="12h">12-hour (1:00 PM)</option>
                      <option value="24h">24-hour (13:00)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Launch at Startup</div>
                      <div className="text-[11px] text-slate-400">Start DailyFlow automatically when logging in</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.general.launchAtLogin}
                      onChange={(e) =>
                        handleUpdate({ general: { launchAtLogin: e.target.checked } })
                      }
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCTIVITY */}
              {activeTab === 'productivity' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Default View on App Launch</div>
                      <div className="text-[11px] text-slate-400">Primary task canvas opened when DailyFlow starts</div>
                    </div>
                    <select
                      value={settings.productivity.defaultView}
                      onChange={(e) =>
                        handleUpdate({
                          productivity: { defaultView: e.target.value as 'today' | 'upcoming' },
                        })
                      }
                      className="bg-slate-800 text-slate-200 text-xs rounded px-3 py-1.5 border border-slate-700 focus:outline-none"
                    >
                      <option value="today">Today Canvas</option>
                      <option value="upcoming">Upcoming View</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Default Focus Timer Duration</div>
                      <div className="text-[11px] text-slate-400">Standard initial timer length in Focus Mode</div>
                    </div>
                    <select
                      value={settings.productivity.defaultFocusMinutes}
                      onChange={(e) =>
                        handleUpdate({
                          productivity: { defaultFocusMinutes: Number(e.target.value) },
                        })
                      }
                      className="bg-slate-800 text-slate-200 text-xs rounded px-3 py-1.5 border border-slate-700 focus:outline-none"
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={25}>25 Minutes (Pomodoro)</option>
                      <option value={45}>45 Minutes (Deep Work)</option>
                      <option value={60}>60 Minutes (1 Hour)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Auto-Expand Morning Briefing</div>
                      <div className="text-[11px] text-slate-400">Show daily focus goals banner automatically</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.productivity.autoOpenDailyBriefing}
                      onChange={(e) =>
                        handleUpdate({
                          productivity: { autoOpenDailyBriefing: e.target.checked },
                        })
                      }
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: APPEARANCE */}
              {activeTab === 'appearance' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Color Theme</div>
                      <div className="text-[11px] text-slate-400">Theme mode for the user interface</div>
                    </div>
                    <select
                      value={settings.appearance.theme}
                      onChange={(e) =>
                        handleUpdate({
                          appearance: { theme: e.target.value as 'dark' | 'light' | 'system' },
                        })
                      }
                      className="bg-slate-800 text-slate-200 text-xs rounded px-3 py-1.5 border border-slate-700 focus:outline-none"
                    >
                      <option value="dark">Dark Theme (Default)</option>
                      <option value="light">Light Theme</option>
                      <option value="system">Follow OS System</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Task Item Density</div>
                      <div className="text-[11px] text-slate-400">Comfortable spacing vs compact item rows</div>
                    </div>
                    <select
                      value={settings.appearance.density}
                      onChange={(e) =>
                        handleUpdate({
                          appearance: { density: e.target.value as 'comfortable' | 'compact' },
                        })
                      }
                      className="bg-slate-800 text-slate-200 text-xs rounded px-3 py-1.5 border border-slate-700 focus:outline-none"
                    >
                      <option value="comfortable">Comfortable (Standard)</option>
                      <option value="compact">Compact (High Density)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Accent Highlight Color</div>
                      <div className="text-[11px] text-slate-400">Color palette accent tint</div>
                    </div>
                    <select
                      value={settings.appearance.accentColor}
                      onChange={(e) =>
                        handleUpdate({
                          appearance: {
                            accentColor: e.target.value as
                              | 'indigo'
                              | 'emerald'
                              | 'violet'
                              | 'amber'
                              | 'cyan',
                          },
                        })
                      }
                      className="bg-slate-800 text-slate-200 text-xs rounded px-3 py-1.5 border border-slate-700 focus:outline-none capitalize"
                    >
                      <option value="indigo">Indigo Accent</option>
                      <option value="emerald">Emerald Accent</option>
                      <option value="violet">Violet Accent</option>
                      <option value="amber">Amber Accent</option>
                      <option value="cyan">Cyan Accent</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Environment Theme</div>
                      <div className="text-[11px] text-slate-400">Select photographic background atmosphere</div>
                    </div>
                    <select
                      value={settings.appearance.environment || 'emerald-forest'}
                      onChange={(e) =>
                        handleUpdate({
                          appearance: {
                            environment: e.target.value as
                              | 'emerald-forest'
                              | 'deep-ocean'
                              | 'mountain-lake'
                              | 'night-sky'
                              | 'sunset-horizon',
                          },
                        })
                      }
                      className="bg-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none"
                    >
                      <option value="emerald-forest">🌿 Emerald Forest</option>
                      <option value="deep-ocean">🌊 Deep Ocean</option>
                      <option value="mountain-lake">🏔️ Mountain Lake</option>
                      <option value="night-sky">🌌 Night Sky</option>
                      <option value="sunset-horizon">🌅 Sunset Horizon</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Reduced Motion</div>
                      <div className="text-[11px] text-slate-400 font-semibold text-slate-400">Minimize animations and transition effects</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.appearance.reducedMotion}
                      onChange={(e) =>
                        handleUpdate({ appearance: { reducedMotion: e.target.checked } })
                      }
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                    <div>
                      <div className="text-sm font-bold text-white">Master Desktop Notifications</div>
                      <div className="text-xs text-slate-400">Enable OS native task alerts and daily briefings</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.enabled}
                      onChange={(e) =>
                        handleUpdate({ notifications: { enabled: e.target.checked } })
                      }
                      className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className={`space-y-3 ${!settings.notifications.enabled ? 'opacity-40 pointer-events-none' : ''}`}>
                    <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                      <div>
                        <div className="text-xs font-semibold text-slate-200">Scheduled Task Lead Reminders</div>
                        <div className="text-[11px] text-slate-400">Alert minutes before scheduled time</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={settings.notifications.taskReminderLeadMinutes}
                          onChange={(e) =>
                            handleUpdate({
                              notifications: { taskReminderLeadMinutes: Number(e.target.value) },
                            })
                          }
                          className="bg-slate-800 text-slate-200 text-xs rounded px-2 py-1 border border-slate-700 focus:outline-none"
                        >
                          <option value={5}>5 mins before</option>
                          <option value={10}>10 mins before</option>
                          <option value={15}>15 mins before</option>
                          <option value={30}>30 mins before</option>
                        </select>
                        <input
                          type="checkbox"
                          checked={settings.notifications.taskRemindersEnabled}
                          onChange={(e) =>
                            handleUpdate({ notifications: { taskRemindersEnabled: e.target.checked } })
                          }
                          className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                      <div>
                        <div className="text-xs font-semibold text-slate-200">Morning Briefing Alert</div>
                        <div className="text-[11px] text-slate-400">Daily start-of-day reminder time</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="time"
                          value={settings.notifications.dailyBriefingTime}
                          onChange={(e) =>
                            handleUpdate({ notifications: { dailyBriefingTime: e.target.value } })
                          }
                          style={{ colorScheme: 'dark' }}
                          className="bg-slate-800 text-slate-200 text-xs rounded px-2 py-1 border border-slate-700 focus:outline-none"
                        />
                        <input
                          type="checkbox"
                          checked={settings.notifications.dailyBriefingReminderEnabled}
                          onChange={(e) =>
                            handleUpdate({
                              notifications: { dailyBriefingReminderEnabled: e.target.checked },
                            })
                          }
                          className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                      <div>
                        <div className="text-xs font-semibold text-slate-200">Evening Summary Alert</div>
                        <div className="text-[11px] text-slate-400">Daily end-of-day review reminder time</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="time"
                          value={settings.notifications.dailySummaryTime}
                          onChange={(e) =>
                            handleUpdate({ notifications: { dailySummaryTime: e.target.value } })
                          }
                          style={{ colorScheme: 'dark' }}
                          className="bg-slate-800 text-slate-200 text-xs rounded px-2 py-1 border border-slate-700 focus:outline-none"
                        />
                        <input
                          type="checkbox"
                          checked={settings.notifications.dailySummaryReminderEnabled}
                          onChange={(e) =>
                            handleUpdate({
                              notifications: { dailySummaryReminderEnabled: e.target.checked },
                            })
                          }
                          className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{testResult || 'Test native desktop OS alert capability'}</span>
                    <button
                      type="button"
                      onClick={handleSendTestNotification}
                      disabled={!settings.notifications.enabled}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                    >
                      Send Test Alert
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: ENGAGEMENT */}
              {activeTab === 'engagement' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">100% Completion Celebration</div>
                      <div className="text-[11px] text-slate-400">Show celebration popup when all today's tasks are done</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.engagement.showCelebrations}
                      onChange={(e) =>
                        handleUpdate({ engagement: { showCelebrations: e.target.checked } })
                      }
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Streak & Level Banners</div>
                      <div className="text-[11px] text-slate-400">Display streak level badge in the top navigation header</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.engagement.showStreakBanners}
                      onChange={(e) =>
                        handleUpdate({ engagement: { showStreakBanners: e.target.checked } })
                      }
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Auto-Mark Task Done on Focus Complete</div>
                      <div className="text-[11px] text-slate-400">Automatically set task completed when Focus timer finishes</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.engagement.autoCompleteTaskOnFocusEnd}
                      onChange={(e) =>
                        handleUpdate({
                          engagement: { autoCompleteTaskOnFocusEnd: e.target.checked },
                        })
                      }
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* TAB 6: DATA & STORAGE */}
              {activeTab === 'data' && (
                <div className="space-y-4">
                  {/* Readonly info */}
                  <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="font-semibold text-slate-200 flex items-center justify-between">
                      <span>Database File Path</span>
                      <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-indigo-300">
                        SQLite 3
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-slate-400 break-all">
                      {settings.storage.dbPath || 'In-Memory / Default Path'}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                      <span>Database File Size</span>
                      <span className="font-mono font-semibold text-slate-300">
                        {Math.round((settings.storage.dbSizeBytes || 0) / 1024)} KB
                      </span>
                    </div>
                  </div>

                  {/* Backup and Restore Actions */}
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Backup & Data Portability
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold text-slate-200">Export Application Backup</div>
                        <div className="text-[11px] text-slate-400">
                          Export tasks, logs, achievements, and settings as JSON
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleExport}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition-all whitespace-nowrap"
                      >
                        Export JSON
                      </button>
                    </div>

                    <div className="border-t border-slate-800 pt-3 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold text-slate-200">Restore from Backup</div>
                        <div className="text-[11px] text-slate-400">
                          Import and replace data from a valid JSON backup file
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleImport}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-all whitespace-nowrap"
                      >
                        Import JSON
                      </button>
                    </div>
                  </div>

                  {/* Danger Zone: Reset */}
                  <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-3">
                    <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>⚠️</span> Danger Zone
                    </div>

                    {!showResetConfirm ? (
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-semibold text-slate-200">Reset Application Data</div>
                          <div className="text-[11px] text-slate-400">
                            Clear all tasks, focus logs, and reset settings to default
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowResetConfirm(true)}
                          className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg transition-all whitespace-nowrap"
                        >
                          Reset App Data
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 bg-rose-950/60 p-3.5 rounded-lg border border-rose-500/40">
                        <div className="text-xs font-bold text-rose-200">
                          Confirm Application Reset
                        </div>
                        <p className="text-[11px] text-rose-300 leading-relaxed">
                          This action will permanently delete all tasks, engagement history, and custom preferences. Type <span className="font-mono font-bold underline">RESET</span> below to confirm.
                        </p>

                        {resetError && (
                          <div className="text-[11px] font-semibold text-rose-400">{resetError}</div>
                        )}

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={resetInput}
                            onChange={(e) => setResetInput(e.target.value)}
                            placeholder="Type RESET"
                            className="bg-slate-900 border border-rose-500/50 text-rose-200 font-mono text-xs rounded px-3 py-1.5 focus:outline-none flex-1"
                          />
                          <button
                            type="button"
                            onClick={handleReset}
                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow"
                          >
                            Confirm Reset
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowResetConfirm(false);
                              setResetInput('');
                              setResetError(null);
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">DailyFlow Core Personalization v1.0</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
