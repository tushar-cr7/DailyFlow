import type Database from 'better-sqlite3';

interface Migration {
  version: number;
  name: string;
  up: (db: Database.Database) => void;
}

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: '001_initial_tasks_schema',
    up: (db: Database.Database) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          date TEXT NOT NULL,
          scheduled_time TEXT,
          is_completed INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
        CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON tasks(is_completed);
      `);
    },
  },
  {
    version: 2,
    name: '002_engagement_engine_schema',
    up: (db: Database.Database) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS user_engagement (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          total_xp INTEGER NOT NULL DEFAULT 0,
          current_level INTEGER NOT NULL DEFAULT 1,
          current_streak INTEGER NOT NULL DEFAULT 0,
          longest_streak INTEGER NOT NULL DEFAULT 0,
          last_active_date TEXT,
          perfect_days_count INTEGER NOT NULL DEFAULT 0,
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        INSERT OR IGNORE INTO user_engagement (id, total_xp, current_level, current_streak, longest_streak, perfect_days_count)
        VALUES (1, 0, 1, 0, 0, 0);

        CREATE TABLE IF NOT EXISTS user_achievements (
          id TEXT PRIMARY KEY,
          progress INTEGER NOT NULL DEFAULT 0,
          is_unlocked INTEGER NOT NULL DEFAULT 0,
          unlocked_at TEXT,
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS daily_engagement_logs (
          date TEXT PRIMARY KEY,
          tasks_scheduled INTEGER NOT NULL DEFAULT 0,
          tasks_completed INTEGER NOT NULL DEFAULT 0,
          is_perfect_day INTEGER NOT NULL DEFAULT 0,
          xp_earned INTEGER NOT NULL DEFAULT 0,
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_daily_engagement_date ON daily_engagement_logs(date);
      `);
    },
  },
];

export function runMigrations(db: Database.Database): void {
  // Ensure schema_migrations table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const appliedRows = db
    .prepare('SELECT version FROM schema_migrations')
    .all() as { version: number }[];
  const appliedVersions = new Set(appliedRows.map((r) => r.version));

  for (const migration of MIGRATIONS) {
    if (!appliedVersions.has(migration.version)) {
      const applyMigration = db.transaction(() => {
        migration.up(db);
        db.prepare(
          'INSERT INTO schema_migrations (version, name) VALUES (?, ?)',
        ).run(migration.version, migration.name);
      });
      applyMigration();
    }
  }
}

export function getDatabaseTables(db: Database.Database): string[] {
  const rows = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC",
    )
    .all() as { name: string }[];
  return rows.map((r) => r.name);
}
