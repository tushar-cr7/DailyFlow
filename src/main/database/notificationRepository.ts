import type Database from 'better-sqlite3';
import { getDatabase } from './connection';
import type {
  NotificationSettings,
  UpdateNotificationSettingsDTO,
  NotificationType,
} from '../../shared/types/notifications';

interface NotificationSettingsRow {
  id: number;
  enabled: number;
  task_reminders_enabled: number;
  task_reminder_lead_minutes: number;
  overdue_reminders_enabled: number;
  daily_briefing_reminder_enabled: number;
  daily_briefing_time: string;
  daily_summary_reminder_enabled: number;
  daily_summary_time: string;
  focus_reminders_enabled: number;
  updated_at: string;
}

export function getNotificationSettings(customDb?: Database.Database): NotificationSettings {
  const db = customDb || getDatabase();
  const row = db
    .prepare('SELECT * FROM notification_settings WHERE id = 1')
    .get() as NotificationSettingsRow | undefined;

  if (!row) {
    return {
      enabled: true,
      taskRemindersEnabled: true,
      taskReminderLeadMinutes: 5,
      overdueRemindersEnabled: true,
      dailyBriefingReminderEnabled: true,
      dailyBriefingTime: '09:00',
      dailySummaryReminderEnabled: true,
      dailySummaryTime: '18:00',
      focusRemindersEnabled: true,
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    enabled: row.enabled === 1,
    taskRemindersEnabled: row.task_reminders_enabled === 1,
    taskReminderLeadMinutes: row.task_reminder_lead_minutes,
    overdueRemindersEnabled: row.overdue_reminders_enabled === 1,
    dailyBriefingReminderEnabled: row.daily_briefing_reminder_enabled === 1,
    dailyBriefingTime: row.daily_briefing_time,
    dailySummaryReminderEnabled: row.daily_summary_reminder_enabled === 1,
    dailySummaryTime: row.daily_summary_time,
    focusRemindersEnabled: row.focus_reminders_enabled === 1,
    updatedAt: row.updated_at,
  };
}

export function updateNotificationSettings(
  dto: UpdateNotificationSettingsDTO,
  customDb?: Database.Database,
): NotificationSettings {
  const db = customDb || getDatabase();
  const current = getNotificationSettings(db);

  const updated: NotificationSettings = {
    ...current,
    ...dto,
    updatedAt: new Date().toISOString(),
  };

  db.prepare(`
    UPDATE notification_settings
    SET enabled = ?,
        task_reminders_enabled = ?,
        task_reminder_lead_minutes = ?,
        overdue_reminders_enabled = ?,
        daily_briefing_reminder_enabled = ?,
        daily_briefing_time = ?,
        daily_summary_reminder_enabled = ?,
        daily_summary_time = ?,
        focus_reminders_enabled = ?,
        updated_at = datetime('now')
    WHERE id = 1
  `).run(
    updated.enabled ? 1 : 0,
    updated.taskRemindersEnabled ? 1 : 0,
    updated.taskReminderLeadMinutes,
    updated.overdueRemindersEnabled ? 1 : 0,
    updated.dailyBriefingReminderEnabled ? 1 : 0,
    updated.dailyBriefingTime,
    updated.dailySummaryReminderEnabled ? 1 : 0,
    updated.dailySummaryTime,
    updated.focusRemindersEnabled ? 1 : 0,
  );

  return updated;
}

export function isNotificationSent(
  type: NotificationType,
  referenceId: string,
  customDb?: Database.Database,
): boolean {
  const db = customDb || getDatabase();
  const row = db
    .prepare('SELECT 1 FROM notification_logs WHERE type = ? AND reference_id = ?')
    .get(type, referenceId);
  return !!row;
}

export function logNotificationSent(
  type: NotificationType,
  referenceId: string,
  customDb?: Database.Database,
): void {
  const db = customDb || getDatabase();
  const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  db.prepare(`
    INSERT OR IGNORE INTO notification_logs (id, type, reference_id, sent_at)
    VALUES (?, ?, ?, datetime('now'))
  `).run(id, type, referenceId);
}
