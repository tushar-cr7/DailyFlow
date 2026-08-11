import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations, getDatabaseTables } from '../src/main/database/schema';
import {
  getNotificationSettings,
  updateNotificationSettings,
  isNotificationSent,
  logNotificationSent,
} from '../src/main/database/notificationRepository';

describe('Notification Repository & Migration 004 Integration Tests', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    runMigrations(db);
  });

  afterEach(() => {
    if (db) db.close();
  });

  it('applies Migration 004 creating notification_settings and notification_logs tables', () => {
    const tables = getDatabaseTables(db);
    expect(tables).toContain('notification_settings');
    expect(tables).toContain('notification_logs');
  });

  it('fetches default notification settings', () => {
    const settings = getNotificationSettings(db);
    expect(settings.enabled).toBe(true);
    expect(settings.taskRemindersEnabled).toBe(true);
    expect(settings.taskReminderLeadMinutes).toBe(5);
    expect(settings.dailyBriefingTime).toBe('09:00');
  });

  it('persists notification settings updates accurately', () => {
    const updated = updateNotificationSettings(
      {
        taskReminderLeadMinutes: 15,
        dailyBriefingTime: '08:30',
        enabled: false,
      },
      db,
    );

    expect(updated.taskReminderLeadMinutes).toBe(15);
    expect(updated.dailyBriefingTime).toBe('08:30');
    expect(updated.enabled).toBe(false);

    const reFetched = getNotificationSettings(db);
    expect(reFetched.taskReminderLeadMinutes).toBe(15);
    expect(reFetched.dailyBriefingTime).toBe('08:30');
    expect(reFetched.enabled).toBe(false);
  });

  it('prevents duplicate notifications via SQLite deduplication logs', () => {
    expect(isNotificationSent('task_reminder', 'ref-100', db)).toBe(false);

    logNotificationSent('task_reminder', 'ref-100', db);

    expect(isNotificationSent('task_reminder', 'ref-100', db)).toBe(true);
    expect(isNotificationSent('task_reminder', 'ref-200', db)).toBe(false);
  });
});
