import React, { useState, useEffect } from 'react';
import type { NotificationSettings } from '../../shared/types/notifications';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const api = window.dailyflow;
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      void fetchSettings();
    }
  }, [isOpen]);

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await api.getNotificationSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch {
      // Ignore background fetch error
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleField(field: keyof NotificationSettings, value: unknown) {
    if (!settings) return;
    const updated = { ...settings, [field]: value };
    setSettings(updated);

    try {
      const res = await api.updateNotificationSettings({ [field]: value });
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch {
      // Ignore save error
    }
  }

  async function handleSendTest() {
    setTestResult(null);
    try {
      const res = await api.testNotification();
      if (res.success && res.data?.sent) {
        setTestResult('✓ Test desktop notification sent!');
      } else {
        setTestResult('⚠️ Test notification skipped (already sent or disabled).');
      }
    } catch (err) {
      setTestResult(err instanceof Error ? err.message : 'Failed to send test.');
    }
  }

  if (!isOpen || !settings) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-1">
          <span>🔔</span> Desktop Companion
        </div>

        <h2 className="text-xl font-bold text-white mb-4">Notification Preferences</h2>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading settings...</div>
        ) : (
          <div className="space-y-4">
            {/* Master Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <div>
                <div className="text-sm font-bold text-white">Master Desktop Notifications</div>
                <div className="text-xs text-slate-400">
                  Allow DailyFlow to send native OS desktop alerts
                </div>
              </div>

              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => handleToggleField('enabled', e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            {/* Detailed Controls */}
            <div className={`space-y-3 ${!settings.enabled ? 'opacity-40 pointer-events-none' : ''}`}>
              {/* Task Reminders */}
              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Scheduled Task Reminders</div>
                  <div className="text-[11px] text-slate-400">
                    Notify before task scheduled time
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={settings.taskReminderLeadMinutes}
                    onChange={(e) =>
                      handleToggleField('taskReminderLeadMinutes', Number(e.target.value))
                    }
                    className="bg-slate-800 text-slate-200 text-xs rounded px-2 py-1 border border-slate-700 focus:outline-none"
                  >
                    <option value={5}>5 mins before</option>
                    <option value={10}>10 mins before</option>
                    <option value={15}>15 mins before</option>
                  </select>

                  <input
                    type="checkbox"
                    checked={settings.taskRemindersEnabled}
                    onChange={(e) => handleToggleField('taskRemindersEnabled', e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Daily Briefing Reminder */}
              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Morning Briefing Alert</div>
                  <div className="text-[11px] text-slate-400">Daily start-of-day reminder</div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={settings.dailyBriefingTime}
                    onChange={(e) => handleToggleField('dailyBriefingTime', e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="bg-slate-800 text-slate-200 text-xs rounded px-2 py-1 border border-slate-700 focus:outline-none"
                  />
                  <input
                    type="checkbox"
                    checked={settings.dailyBriefingReminderEnabled}
                    onChange={(e) =>
                      handleToggleField('dailyBriefingReminderEnabled', e.target.checked)
                    }
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Evening Summary Reminder */}
              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Evening Summary Alert</div>
                  <div className="text-[11px] text-slate-400">End-of-day reflection reminder</div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={settings.dailySummaryTime}
                    onChange={(e) => handleToggleField('dailySummaryTime', e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="bg-slate-800 text-slate-200 text-xs rounded px-2 py-1 border border-slate-700 focus:outline-none"
                  />
                  <input
                    type="checkbox"
                    checked={settings.dailySummaryReminderEnabled}
                    onChange={(e) =>
                      handleToggleField('dailySummaryReminderEnabled', e.target.checked)
                    }
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Focus Completion Alert */}
              <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Focus Mode Timer Completion</div>
                  <div className="text-[11px] text-slate-400">Notify when focus session timer finishes</div>
                </div>

                <input
                  type="checkbox"
                  checked={settings.focusRemindersEnabled}
                  onChange={(e) => handleToggleField('focusRemindersEnabled', e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Test Notification Action */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              {testResult ? (
                <span className="text-xs font-semibold text-emerald-400">{testResult}</span>
              ) : (
                <span className="text-xs text-slate-400">Uses native desktop OS notifications</span>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendTest}
                  disabled={!settings.enabled}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                >
                  Test Notification
                </button>
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
        )}
      </div>
    </div>
  );
};
