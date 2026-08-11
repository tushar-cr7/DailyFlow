import fs from 'node:fs';
import { dialog } from 'electron';
import type Database from 'better-sqlite3';
import { getDatabase } from '../database/connection';
import { getUserSettings, updateUserSettings } from '../database/settingsRepository';
import { getNotificationSettings, updateNotificationSettings } from '../database/notificationRepository';
import { DEFAULT_USER_SETTINGS, validateBackupData } from '../../shared/utils/settingsValidation';
import type { DailyFlowBackupData } from '../../shared/types/settings';

export function exportBackupPayload(customDb?: Database.Database): DailyFlowBackupData {
  const db = customDb || getDatabase();
  const settings = getUserSettings(db);
  const notifSettings = getNotificationSettings(db);

  const tasks = db.prepare('SELECT * FROM tasks').all();
  const userEngagement = db.prepare('SELECT * FROM user_engagement WHERE id = 1').get();
  const achievements = db.prepare('SELECT * FROM user_achievements').all();
  const dailyLogs = db.prepare('SELECT * FROM daily_engagement_logs').all();
  const focusSessions = db.prepare('SELECT * FROM focus_sessions').all();

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    userSettings: {
      general: settings.general,
      productivity: settings.productivity,
      appearance: settings.appearance,
      engagement: settings.engagement,
    },
    notificationSettings: notifSettings,
    tasks,
    userEngagement,
    achievements,
    dailyLogs,
    focusSessions,
  };
}

export async function exportUserDataToFile(customDb?: Database.Database): Promise<{ exported: boolean; filePath?: string }> {
  const payload = exportBackupPayload(customDb);
  const jsonStr = JSON.stringify(payload, null, 2);

  const dateStr = new Date().toISOString().slice(0, 10);
  const defaultPath = `dailyflow-backup-${dateStr}.json`;

  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Export DailyFlow Backup Data',
    defaultPath,
    filters: [{ name: 'JSON Backup (*.json)', extensions: ['json'] }],
  });

  if (canceled || !filePath) {
    return { exported: false };
  }

  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, jsonStr, 'utf-8');
  fs.renameSync(tempPath, filePath);
  return { exported: true, filePath };
}

export function restoreBackupPayload(
  payload: unknown,
  customDb?: Database.Database,
): { imported: boolean; taskCount: number } {
  const db = customDb || getDatabase();

  const { valid, errors, backup } = validateBackupData(payload);
  if (!valid || !backup) {
    throw new Error(`Invalid backup data: ${errors.join(', ')}`);
  }

  const runRestore = db.transaction(() => {
    // 1. Wipe existing tables
    db.prepare('DELETE FROM focus_sessions').run();
    db.prepare('DELETE FROM daily_engagement_logs').run();
    db.prepare('DELETE FROM user_achievements').run();
    db.prepare('DELETE FROM tasks').run();

    // 2. Restore tasks
    if (Array.isArray(backup.tasks)) {
      const insertTask = db.prepare(`
        INSERT INTO tasks (id, title, description, date, scheduled_time, is_completed, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const t of backup.tasks as Record<string, unknown>[]) {
        insertTask.run(
          t.id,
          t.title,
          t.description ?? null,
          t.date,
          t.scheduled_time ?? null,
          t.is_completed ? 1 : 0,
          t.created_at || new Date().toISOString(),
          t.updated_at || new Date().toISOString(),
        );
      }
    }

    // 3. Restore user_engagement
    if (backup.userEngagement && typeof backup.userEngagement === 'object') {
      const eng = backup.userEngagement as Record<string, unknown>;
      db.prepare(`
        INSERT OR REPLACE INTO user_engagement (id, total_xp, current_level, current_streak, longest_streak, last_active_date, perfect_days_count, updated_at)
        VALUES (1, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        eng.total_xp ?? 0,
        eng.current_level ?? 1,
        eng.current_streak ?? 0,
        eng.longest_streak ?? 0,
        eng.last_active_date ?? null,
        eng.perfect_days_count ?? 0,
      );
    }

    // 4. Restore achievements
    if (Array.isArray(backup.achievements)) {
      const insertAch = db.prepare(`
        INSERT OR REPLACE INTO user_achievements (id, progress, is_unlocked, unlocked_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const a of backup.achievements as Record<string, unknown>[]) {
        insertAch.run(
          a.id,
          a.progress ?? 0,
          a.is_unlocked ? 1 : 0,
          a.unlocked_at ?? null,
          a.updated_at || new Date().toISOString(),
        );
      }
    }

    // 5. Restore daily logs
    if (Array.isArray(backup.dailyLogs)) {
      const insertLog = db.prepare(`
        INSERT OR REPLACE INTO daily_engagement_logs (
          date, tasks_scheduled, tasks_completed, is_perfect_day, xp_earned,
          primary_task_id, daily_reflection, total_focus_minutes, is_summary_reviewed, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const l of backup.dailyLogs as Record<string, unknown>[]) {
        insertLog.run(
          l.date,
          l.tasks_scheduled ?? 0,
          l.tasks_completed ?? 0,
          l.is_perfect_day ? 1 : 0,
          l.xp_earned ?? 0,
          l.primary_task_id ?? null,
          l.daily_reflection ?? null,
          l.total_focus_minutes ?? 0,
          l.is_summary_reviewed ? 1 : 0,
          l.updated_at || new Date().toISOString(),
        );
      }
    }

    // 6. Restore focus sessions
    if (Array.isArray(backup.focusSessions)) {
      const insertSession = db.prepare(`
        INSERT OR REPLACE INTO focus_sessions (id, task_id, date, duration_seconds, completed_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const s of backup.focusSessions as Record<string, unknown>[]) {
        insertSession.run(
          s.id,
          s.task_id ?? null,
          s.date,
          s.duration_seconds ?? 0,
          s.completed_at || new Date().toISOString(),
          s.created_at || new Date().toISOString(),
        );
      }
    }

    // 7. Restore notification & user settings
    if (backup.notificationSettings) {
      updateNotificationSettings(backup.notificationSettings, db);
    }
    if (backup.userSettings) {
      updateUserSettings(backup.userSettings, db);
    }
  });

  runRestore();

  const taskCount = backup.tasks ? backup.tasks.length : 0;
  return { imported: true, taskCount };
}

export async function importUserDataFromFile(customDb?: Database.Database): Promise<{ imported: boolean; taskCount: number }> {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Import DailyFlow Backup File',
    properties: ['openFile'],
    filters: [{ name: 'JSON Backup (*.json)', extensions: ['json'] }],
  });

  const selectedPath = filePaths[0];
  if (canceled || !selectedPath) {
    return { imported: false, taskCount: 0 };
  }

  const rawText = fs.readFileSync(selectedPath, 'utf-8');
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error('Selected file is not valid JSON format');
  }

  return restoreBackupPayload(parsed, customDb);
}

export function resetApplicationData(
  confirmation: string,
  customDb?: Database.Database,
): { reset: boolean } {
  if (confirmation !== 'RESET') {
    throw new Error('Reset failed: Confirmation string must strictly equal "RESET"');
  }

  const db = customDb || getDatabase();

  const runReset = db.transaction(() => {
    db.prepare('DELETE FROM focus_sessions').run();
    db.prepare('DELETE FROM daily_engagement_logs').run();
    db.prepare('DELETE FROM user_achievements').run();
    db.prepare('DELETE FROM tasks').run();

    // Reset user_engagement table
    db.prepare(`
      UPDATE user_engagement
      SET total_xp = 0,
          current_level = 1,
          current_streak = 0,
          longest_streak = 0,
          last_active_date = NULL,
          perfect_days_count = 0,
          updated_at = datetime('now')
      WHERE id = 1
    `).run();

    // Reset notification_settings table to defaults
    db.prepare(`
      UPDATE notification_settings
      SET enabled = 1,
          task_reminders_enabled = 1,
          task_reminder_lead_minutes = 5,
          overdue_reminders_enabled = 1,
          daily_briefing_reminder_enabled = 1,
          daily_briefing_time = '09:00',
          daily_summary_reminder_enabled = 1,
          daily_summary_time = '18:00',
          focus_reminders_enabled = 1,
          updated_at = datetime('now')
      WHERE id = 1
    `).run();

    // Reset user_settings table to defaults
    db.prepare(`
      UPDATE user_settings
      SET user_name = ?,
          start_of_week = ?,
          time_format = ?,
          launch_at_login = ?,
          default_view = ?,
          default_focus_minutes = ?,
          auto_open_daily_briefing = ?,
          preset_focus_durations = ?,
          theme = ?,
          density = ?,
          reduced_motion = ?,
          accent_color = ?,
          show_celebrations = ?,
          show_streak_banners = ?,
          show_xp_notifications = ?,
          auto_complete_task_on_focus_end = ?,
          updated_at = datetime('now')
      WHERE id = 1
    `).run(
      DEFAULT_USER_SETTINGS.general.userName,
      DEFAULT_USER_SETTINGS.general.startOfWeek,
      DEFAULT_USER_SETTINGS.general.timeFormat,
      DEFAULT_USER_SETTINGS.general.launchAtLogin ? 1 : 0,
      DEFAULT_USER_SETTINGS.productivity.defaultView,
      DEFAULT_USER_SETTINGS.productivity.defaultFocusMinutes,
      DEFAULT_USER_SETTINGS.productivity.autoOpenDailyBriefing ? 1 : 0,
      JSON.stringify(DEFAULT_USER_SETTINGS.productivity.presetFocusDurations),
      DEFAULT_USER_SETTINGS.appearance.theme,
      DEFAULT_USER_SETTINGS.appearance.density,
      DEFAULT_USER_SETTINGS.appearance.reducedMotion ? 1 : 0,
      DEFAULT_USER_SETTINGS.appearance.accentColor,
      DEFAULT_USER_SETTINGS.engagement.showCelebrations ? 1 : 0,
      DEFAULT_USER_SETTINGS.engagement.showStreakBanners ? 1 : 0,
      DEFAULT_USER_SETTINGS.engagement.showXPNotifications ? 1 : 0,
      DEFAULT_USER_SETTINGS.engagement.autoCompleteTaskOnFocusEnd ? 1 : 0,
    );
  });

  runReset();

  return { reset: true };
}
