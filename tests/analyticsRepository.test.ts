import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../src/main/database/schema';
import { createTask, updateTask } from '../src/main/database/taskRepository';
import { logFocusSession } from '../src/main/database/dailyExperienceRepository';
import { getAnalyticsReport } from '../src/main/database/analyticsRepository';

describe('Analytics Repository Integration Tests', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    runMigrations(db);
  });

  afterEach(() => {
    if (db) db.close();
  });

  it('queries analytics report correctly for empty database without throwing', () => {
    const report = getAnalyticsReport({ range: '7d', referenceDate: '2026-08-11' }, db);

    expect(report.overview.tasksCreated).toBe(0);
    expect(report.overview.tasksCompleted).toBe(0);
    expect(report.overview.completionRate).toBe(0);
    expect(report.overview.totalFocusMinutes).toBe(0);
    expect(report.insights.length).toBeGreaterThan(0);
  });

  it('aggregates task, focus session, and streak metrics across range from SQLite tables', () => {
    // 1. Create tasks across multiple dates
    const t1 = createTask({ title: 'Task 1', date: '2026-08-09', scheduledTime: '10:00' }, db);
    const t2 = createTask({ title: 'Task 2', date: '2026-08-10', scheduledTime: '11:00' }, db);
    const t3 = createTask({ title: 'Task 3', date: '2026-08-11', scheduledTime: '14:00' }, db);

    // Complete t1 and t2
    updateTask({ id: t1.id, isCompleted: true }, db);
    updateTask({ id: t2.id, isCompleted: true }, db);

    // 2. Log focus sessions
    logFocusSession({ taskId: t1.id, durationSeconds: 1500, date: '2026-08-09' }, db);
    logFocusSession({ taskId: t2.id, durationSeconds: 1500, date: '2026-08-10' }, db);
    logFocusSession({ taskId: t3.id, durationSeconds: 1500, date: '2026-08-11' }, db);

    // 3. Query 7-day analytics report
    const report = getAnalyticsReport({ range: '7d', referenceDate: '2026-08-11' }, db);

    expect(report.overview.tasksCreated).toBe(3);
    expect(report.overview.tasksCompleted).toBe(2);
    expect(report.overview.completionRate).toBe(67); // 2/3 = 67%
    expect(report.overview.totalFocusMinutes).toBe(75); // 25 * 3 = 75
    expect(report.patterns.peakFocusHour).not.toBeNull();
  });

  it('handles monthly and 30-day date ranges accurately', () => {
    createTask({ title: 'Old Month Task', date: '2026-08-01', scheduledTime: '09:00' }, db);
    createTask({ title: 'Mid Month Task', date: '2026-08-05', scheduledTime: '10:00' }, db);

    const reportMonth = getAnalyticsReport({ range: 'month', referenceDate: '2026-08-11' }, db);
    expect(reportMonth.overview.tasksCreated).toBe(2);
    expect(reportMonth.startDate).toBe('2026-08-01');
    expect(reportMonth.endDate).toBe('2026-08-11');

    const report30d = getAnalyticsReport({ range: '30d', referenceDate: '2026-08-11' }, db);
    expect(report30d.dailySeries.length).toBe(30);
  });
});
