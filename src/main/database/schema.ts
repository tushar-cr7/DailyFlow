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
  {
    version: 3,
    name: '003_daily_experience_schema',
    up: (db: Database.Database) => {
      // Safely check existing columns before adding to daily_engagement_logs
      const tableInfo = db.prepare("PRAGMA table_info('daily_engagement_logs')").all() as { name: string }[];
      const existingCols = new Set(tableInfo.map((c) => c.name));

      if (!existingCols.has('primary_task_id')) {
        db.exec("ALTER TABLE daily_engagement_logs ADD COLUMN primary_task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL;");
      }
      if (!existingCols.has('daily_reflection')) {
        db.exec("ALTER TABLE daily_engagement_logs ADD COLUMN daily_reflection TEXT;");
      }
      if (!existingCols.has('total_focus_minutes')) {
        db.exec("ALTER TABLE daily_engagement_logs ADD COLUMN total_focus_minutes INTEGER NOT NULL DEFAULT 0;");
      }
      if (!existingCols.has('is_summary_reviewed')) {
        db.exec("ALTER TABLE daily_engagement_logs ADD COLUMN is_summary_reviewed INTEGER NOT NULL DEFAULT 0;");
      }

      db.exec(`
        CREATE TABLE IF NOT EXISTS focus_sessions (
          id TEXT PRIMARY KEY,
          task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
          date TEXT NOT NULL,
          duration_seconds INTEGER NOT NULL,
          completed_at TEXT NOT NULL DEFAULT (datetime('now')),
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_focus_sessions_date ON focus_sessions(date);
        CREATE INDEX IF NOT EXISTS idx_focus_sessions_task_id ON focus_sessions(task_id);
      `);
    },
  },
  {
    version: 4,
    name: '004_notifications_schema',
    up: (db: Database.Database) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS notification_settings (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          enabled INTEGER NOT NULL DEFAULT 1,
          task_reminders_enabled INTEGER NOT NULL DEFAULT 1,
          task_reminder_lead_minutes INTEGER NOT NULL DEFAULT 5,
          overdue_reminders_enabled INTEGER NOT NULL DEFAULT 1,
          daily_briefing_reminder_enabled INTEGER NOT NULL DEFAULT 1,
          daily_briefing_time TEXT NOT NULL DEFAULT '09:00',
          daily_summary_reminder_enabled INTEGER NOT NULL DEFAULT 1,
          daily_summary_time TEXT NOT NULL DEFAULT '18:00',
          focus_reminders_enabled INTEGER NOT NULL DEFAULT 1,
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        INSERT OR IGNORE INTO notification_settings (id) VALUES (1);

        CREATE TABLE IF NOT EXISTS notification_logs (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          reference_id TEXT NOT NULL,
          sent_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_notification_logs_lookup ON notification_logs(type, reference_id);
      `);
    },
  },
  {
    version: 5,
    name: '005_user_settings_schema',
    up: (db: Database.Database) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS user_settings (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          user_name TEXT NOT NULL DEFAULT 'Flow User',
          start_of_week TEXT NOT NULL DEFAULT 'monday',
          time_format TEXT NOT NULL DEFAULT '12h',
          launch_at_login INTEGER NOT NULL DEFAULT 0,
          default_view TEXT NOT NULL DEFAULT 'today',
          default_focus_minutes INTEGER NOT NULL DEFAULT 25,
          auto_open_daily_briefing INTEGER NOT NULL DEFAULT 1,
          preset_focus_durations TEXT NOT NULL DEFAULT '[15,25,45,60]',
          theme TEXT NOT NULL DEFAULT 'dark',
          density TEXT NOT NULL DEFAULT 'comfortable',
          reduced_motion INTEGER NOT NULL DEFAULT 0,
          accent_color TEXT NOT NULL DEFAULT 'indigo',
          show_celebrations INTEGER NOT NULL DEFAULT 1,
          show_streak_banners INTEGER NOT NULL DEFAULT 1,
          show_xp_notifications INTEGER NOT NULL DEFAULT 1,
          auto_complete_task_on_focus_end INTEGER NOT NULL DEFAULT 0,
          environment TEXT NOT NULL DEFAULT 'emerald-forest',
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        INSERT OR IGNORE INTO user_settings (id) VALUES (1);
      `);
    },
  },
  {
    version: 6,
    name: '006_user_settings_environment_column',
    up: (db: Database.Database) => {
      const tableInfo = db.prepare("PRAGMA table_info('user_settings')").all() as { name: string }[];
      const existingCols = new Set(tableInfo.map((c) => c.name));
      if (!existingCols.has('environment')) {
        db.exec("ALTER TABLE user_settings ADD COLUMN environment TEXT NOT NULL DEFAULT 'emerald-forest';");
      }
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
