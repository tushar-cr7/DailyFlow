import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'node:path';
import { runMigrations, getDatabaseTables } from './schema';
import type { DatabaseStatus } from '../../shared/types/database';

let dbInstance: Database.Database | null = null;
let currentDbPath = '';

export function getDatabasePath(customPath?: string): string {
  if (customPath) {
    return customPath;
  }
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'dailyflow.sqlite');
}

export function initDatabase(customPath?: string): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = getDatabasePath(customPath);
  currentDbPath = dbPath;

  try {
    const db = new Database(dbPath);

    // Apply required performance and reliability PRAGMA settings
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 5000');

    // Run migrations
    runMigrations(db);

    dbInstance = db;
    return dbInstance;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to initialize SQLite database';
    console.error('[Database Init Error]:', errorMsg);
    throw new Error(errorMsg);
  }
}

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    throw new Error('Database has not been initialized. Call initDatabase() first.');
  }
  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch (err) {
      console.error('[Database Close Error]:', err);
    } finally {
      dbInstance = null;
    }
  }
}

export function getDatabaseHealthStatus(): DatabaseStatus {
  if (!dbInstance) {
    return {
      initialized: false,
      dbPath: currentDbPath || getDatabasePath(),
      tableCount: 0,
      tables: [],
      error: 'Database is not initialized',
    };
  }

  try {
    const tables = getDatabaseTables(dbInstance);
    return {
      initialized: true,
      dbPath: currentDbPath,
      tableCount: tables.length,
      tables,
    };
  } catch (err) {
    return {
      initialized: false,
      dbPath: currentDbPath,
      tableCount: 0,
      tables: [],
      error: err instanceof Error ? err.message : 'Failed to check database health',
    };
  }
}
