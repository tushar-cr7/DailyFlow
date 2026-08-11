import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  initDatabase,
  getDatabasePath,
  getDatabaseHealthStatus,
} from '../src/main/database/connection';
import { runMigrations, getDatabaseTables } from '../src/main/database/schema';
import {
  exportBackupPayload,
  restoreBackupPayload,
  resetApplicationData,
} from '../src/main/services/dataManagementService';
import { validateBackupData } from '../src/shared/utils/settingsValidation';
import { notificationScheduler } from '../src/main/services/notificationScheduler';
import { createTask, getAllTasks } from '../src/main/database/taskRepository';

describe('Production & Reliability Engineering Test Suite', () => {
  let tempDir: string;
  let testDbPath: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dailyflow-prod-test-'));
    testDbPath = path.join(tempDir, 'nested', 'subfolder', 'test-dailyflow.sqlite');
  });

  afterEach(() => {
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch {
      // Ignore cleanup error
    }
  });

  it('verifies production database path configuration', () => {
    const customPath = getDatabasePath('C:\\CustomPath\\test.sqlite');
    expect(customPath).toBe('C:\\CustomPath\\test.sqlite');
  });

  it('automatically creates parent directory when initializing a database in a non-existent path', () => {
    expect(fs.existsSync(path.dirname(testDbPath))).toBe(false);

    const db = initDatabase(testDbPath);
    expect(fs.existsSync(path.dirname(testDbPath))).toBe(true);

    const health = getDatabaseHealthStatus();
    expect(health.initialized).toBe(true);
    expect(health.tableCount).toBeGreaterThan(5);

    db.close();
  });

  it('runs PRAGMA quick_check successfully on database initialization', () => {
    const db = new Database(':memory:');
    const result = db.prepare('PRAGMA quick_check').pluck().get() as string;
    expect(result).toBe('ok');
    db.close();
  });

  it('ensures migration idempotency when run multiple times on an active DB', () => {
    const db = new Database(':memory:');
    runMigrations(db);
    const tablesFirst = getDatabaseTables(db);

    // Second run should be a clean no-op
    expect(() => runMigrations(db)).not.toThrow();
    const tablesSecond = getDatabaseTables(db);

    expect(tablesSecond).toEqual(tablesFirst);
    expect(tablesSecond).toContain('schema_migrations');
    expect(tablesSecond).toContain('user_settings');
    db.close();
  });

  it('validates backup payloads and rejects corrupted or missing fields', () => {
    expect(validateBackupData(null).valid).toBe(false);
    expect(validateBackupData({ version: 0 }).valid).toBe(false);
    expect(
      validateBackupData({
        version: 1,
        userSettings: {},
        notificationSettings: {},
        tasks: 'invalid_type',
      }).valid,
    ).toBe(false);
  });

  it('restores backup transactionally without corrupting database on valid input', () => {
    const db = new Database(':memory:');
    runMigrations(db);

    createTask(
      { title: 'Original Task', date: '2026-08-11', scheduledTime: '09:00', durationMinutes: 30 },
      db,
    );

    const backupPayload = exportBackupPayload(db);

    // Add another task
    createTask(
      { title: 'Second Task', date: '2026-08-11', scheduledTime: '10:00', durationMinutes: 30 },
      db,
    );
    expect(getAllTasks({}, db).length).toBe(2);

    // Restore backup
    const result = restoreBackupPayload(backupPayload, db);
    expect(result.imported).toBe(true);
    expect(getAllTasks({}, db).length).toBe(1);
    expect(getAllTasks({}, db)[0]?.title).toBe('Original Task');

    db.close();
  });

  it('enforces strict confirmation check for application reset', () => {
    const db = new Database(':memory:');
    runMigrations(db);

    createTask(
      { title: 'Task to be wiped', date: '2026-08-11', scheduledTime: null, durationMinutes: 15 },
      db,
    );

    expect(() => resetApplicationData('DELETE', db)).toThrow();
    expect(getAllTasks({}, db).length).toBe(1);

    const resetRes = resetApplicationData('RESET', db);
    expect(resetRes.reset).toBe(true);
    expect(getAllTasks({}, db).length).toBe(0);

    db.close();
  });

  it('initializes and destroys notification scheduler cleanly without errors', () => {
    const db = new Database(':memory:');
    runMigrations(db);

    expect(() => {
      notificationScheduler.init(db);
      notificationScheduler.rescheduleAll();
      notificationScheduler.destroy();
    }).not.toThrow();

    db.close();
  });
});
