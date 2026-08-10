import { afterEach, describe, expect, it } from 'vitest';
import {
  initDatabase,
  closeDatabase,
  getDatabaseHealthStatus,
} from '../src/main/database/connection';
import { getDatabaseTables } from '../src/main/database/schema';

describe('SQLite Database Layer (Phase 3)', () => {
  afterEach(() => {
    closeDatabase();
  });

  it('initializes in-memory database and executes migrations', () => {
    const db = initDatabase(':memory:');
    expect(db).toBeDefined();

    const status = getDatabaseHealthStatus();
    expect(status.initialized).toBe(true);
    expect(status.tableCount).toBeGreaterThanOrEqual(2);
    expect(status.tables).toContain('schema_migrations');
    expect(status.tables).toContain('tasks');
  });

  it('configures required SQLite PRAGMA settings', () => {
    const db = initDatabase(':memory:');
    const foreignKeys = db.pragma('foreign_keys', { simple: true });
    const busyTimeout = db.pragma('busy_timeout', { simple: true });

    expect(foreignKeys).toBe(1);
    expect(busyTimeout).toBe(5000);
  });

  it('creates tasks table with expected schema structure', () => {
    const db = initDatabase(':memory:');
    const columns = db
      .prepare("PRAGMA table_info('tasks')")
      .all() as { name: string; type: string; notnull: number; pk: number }[];

    const columnNames = columns.map((c) => c.name);
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('title');
    expect(columnNames).toContain('description');
    expect(columnNames).toContain('date');
    expect(columnNames).toContain('scheduled_time');
    expect(columnNames).toContain('is_completed');
    expect(columnNames).toContain('created_at');
    expect(columnNames).toContain('updated_at');

    const idColumn = columns.find((c) => c.name === 'id');
    expect(idColumn?.pk).toBe(1);
  });

  it('records applied migration in schema_migrations', () => {
    const db = initDatabase(':memory:');
    const migrations = db
      .prepare('SELECT version, name FROM schema_migrations')
      .all() as { version: number; name: string }[];

    expect(migrations).toHaveLength(1);
    expect(migrations[0]?.version).toBe(1);
    expect(migrations[0]?.name).toBe('001_initial_tasks_schema');
  });

  it('handles database close cleanly', () => {
    initDatabase(':memory:');
    closeDatabase();
    const status = getDatabaseHealthStatus();
    expect(status.initialized).toBe(false);
  });
});
