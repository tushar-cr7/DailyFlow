import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations, getDatabaseTables } from '../src/main/database/schema';
import {
  getUserSettings,
  updateUserSettings,
  getStorageInfo,
} from '../src/main/database/settingsRepository';
import {
  exportBackupPayload,
  restoreBackupPayload,
  resetApplicationData,
} from '../src/main/services/dataManagementService';
import {
  validateUpdateUserSettingsDTO,
  validateBackupData,
} from '../src/shared/utils/settingsValidation';
import { createTask } from '../src/main/database/taskRepository';

describe('Settings & Personalization Integration Tests', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    runMigrations(db);
  });

  afterEach(() => {
    if (db) db.close();
  });

  it('applies Migration 005 creating user_settings table', () => {
    const tables = getDatabaseTables(db);
    expect(tables).toContain('user_settings');
  });

  it('retrieves default user settings', () => {
    const settings = getUserSettings(db);
    expect(settings.general.userName).toBe('Flow User');
    expect(settings.general.startOfWeek).toBe('monday');
    expect(settings.general.timeFormat).toBe('12h');
    expect(settings.productivity.defaultView).toBe('today');
    expect(settings.productivity.defaultFocusMinutes).toBe(25);
    expect(settings.appearance.theme).toBe('dark');
    expect(settings.appearance.density).toBe('comfortable');
    expect(settings.appearance.accentColor).toBe('indigo');
    expect(settings.engagement.showCelebrations).toBe(true);
  });

  it('updates settings with valid payload and persists in DB', () => {
    const updated = updateUserSettings(
      {
        general: { userName: 'Alice', timeFormat: '24h' },
        appearance: { theme: 'light', density: 'compact', accentColor: 'emerald' },
      },
      db,
    );

    expect(updated.general.userName).toBe('Alice');
    expect(updated.general.timeFormat).toBe('24h');
    expect(updated.appearance.theme).toBe('light');
    expect(updated.appearance.density).toBe('compact');
    expect(updated.appearance.accentColor).toBe('emerald');

    const reFetched = getUserSettings(db);
    expect(reFetched.general.userName).toBe('Alice');
    expect(reFetched.appearance.density).toBe('compact');
  });

  it('validates settings update payload and rejects invalid inputs', () => {
    const invalidResult = validateUpdateUserSettingsDTO({
      general: { userName: '' }, // empty name
      productivity: { defaultFocusMinutes: 500 }, // out of range
      appearance: { theme: 'neon' }, // invalid enum
    });

    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.length).toBe(3);

    expect(() =>
      updateUserSettings(
        {
          productivity: { defaultFocusMinutes: -10 },
        },
        db,
      ),
    ).toThrow();
  });

  it('exports user data backup and validates payload structure', () => {
    createTask(
      { title: 'Export Test Task', date: '2026-08-11', scheduledTime: '10:00', durationMinutes: 30 },
      db,
    );

    const payload = exportBackupPayload(db);
    expect(payload.version).toBe(1);
    expect(payload.tasks.length).toBe(1);
    expect(payload.tasks[0]?.title).toBe('Export Test Task');

    const validation = validateBackupData(payload);
    expect(validation.valid).toBe(true);
  });

  it('restores backup payload into database successfully', () => {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      userSettings: {
        general: { userName: 'Restored User' },
        appearance: { theme: 'light' },
      },
      notificationSettings: { taskReminderLeadMinutes: 10 },
      tasks: [
        {
          id: 'imported-task-1',
          title: 'Imported Task',
          date: '2026-08-12',
          scheduledTime: '14:00',
          durationMinutes: 45,
          isCompleted: false,
          completedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    const res = restoreBackupPayload(backup, db);
    expect(res.imported).toBe(true);
    expect(res.taskCount).toBe(1);

    const settings = getUserSettings(db);
    expect(settings.general.userName).toBe('Restored User');
  });

  it('resets application data only when confirmation matches "RESET"', () => {
    createTask(
      { title: 'Task to be reset', date: '2026-08-11', scheduledTime: null, durationMinutes: 15 },
      db,
    );

    expect(() => resetApplicationData('WRONG', db)).toThrow();

    const res = resetApplicationData('RESET', db);
    expect(res.reset).toBe(true);

    const settings = getUserSettings(db);
    expect(settings.general.userName).toBe('Flow User');
  });

  it('returns valid storage info structure', () => {
    const storage = getStorageInfo(db);
    expect(storage).toBeDefined();
    expect(storage.dbPath).toBe(':memory:');
  });
});
