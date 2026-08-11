import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations, getDatabaseTables } from '../src/main/database/schema';
import { createTask, deleteTask } from '../src/main/database/taskRepository';
import {
  setPrimaryFocus,
  getDailyBriefing,
  logFocusSession,
  saveDailyReflection,
  getDailySummary,
} from '../src/main/database/dailyExperienceRepository';
import { getEngagementStats } from '../src/main/database/engagementRepository';

describe('Daily Experience Repository & Migration 003', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    runMigrations(db);
  });

  afterEach(() => {
    if (db) db.close();
  });

  it('applies Migration 003 creating focus_sessions and adding extended engagement fields', () => {
    const tables = getDatabaseTables(db);
    expect(tables).toContain('focus_sessions');
    expect(tables).toContain('daily_engagement_logs');

    // Check table info for daily_engagement_logs
    const columns = db.prepare('PRAGMA table_info(daily_engagement_logs)').all() as { name: string }[];
    const colNames = columns.map((c) => c.name);
    expect(colNames).toContain('primary_task_id');
    expect(colNames).toContain('daily_reflection');
    expect(colNames).toContain('total_focus_minutes');
    expect(colNames).toContain('is_summary_reviewed');
  });

  it('pins exactly one primary focus task per day and retrieves in briefing', () => {
    const task1 = createTask({ title: 'Task One', date: '2026-08-11' }, db);
    const task2 = createTask({ title: 'Task Two', date: '2026-08-11' }, db);

    setPrimaryFocus(task1.id, '2026-08-11', db);
    let briefing = getDailyBriefing('2026-08-11', db);
    expect(briefing.primaryFocusTask?.id).toBe(task1.id);

    // Setting a new focus replaces the existing one
    setPrimaryFocus(task2.id, '2026-08-11', db);
    briefing = getDailyBriefing('2026-08-11', db);
    expect(briefing.primaryFocusTask?.id).toBe(task2.id);
  });

  it('safely handles deleting a primary focus task without corrupting daily logs', () => {
    const task = createTask({ title: 'Temporary Focus Task', date: '2026-08-11' }, db);
    setPrimaryFocus(task.id, '2026-08-11', db);

    // Delete the task
    deleteTask(task.id, db);

    // Briefing should gracefully handle null primary focus without throwing
    const briefing = getDailyBriefing('2026-08-11', db);
    expect(briefing.primaryFocusTask).toBeNull();
  });

  it('logs completed focus sessions, updates focus minutes, and awards +15 XP per session', () => {
    const initialStats = getEngagementStats('2026-08-11', db);
    const initialXp = initialStats.state.totalXp;

    const session = logFocusSession({ durationSeconds: 1500, date: '2026-08-11' }, db);
    expect(session.id).toBeDefined();
    expect(session.durationSeconds).toBe(1500);

    const summary = getDailySummary('2026-08-11', db);
    expect(summary.totalFocusMinutes).toBe(25);

    const updatedStats = getEngagementStats('2026-08-11', db);
    expect(updatedStats.state.totalXp).toBe(initialXp + 15);
  });

  it('saves and retrieves daily reflection notes', () => {
    saveDailyReflection('Completed all core features and felt productive.', '2026-08-11', db);
    const summary = getDailySummary('2026-08-11', db);

    expect(summary.reflection).toBe('Completed all core features and felt productive.');
    expect(summary.isSummaryReviewed).toBe(true);
  });
});
