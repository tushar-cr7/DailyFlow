import { describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations, getDatabaseTables } from '../src/main/database/schema';
import { createTask, updateTask } from '../src/main/database/taskRepository';
import {
  getUserEngagementState,
  getEngagementStats,
  recalculateEngagementState,
  getAchievementProgressList,
} from '../src/main/database/engagementRepository';

describe('Phase 7 Full Runtime & Behavior Verification', () => {
  it('executes full task CRUD, XP updates, streak tracking, achievements, and SQLite persistence', () => {
    const db = new Database(':memory:');
    runMigrations(db);

    // 1. Schema check
    const tables = getDatabaseTables(db);
    expect(tables).toContain('tasks');
    expect(tables).toContain('user_engagement');
    expect(tables).toContain('user_achievements');
    expect(tables).toContain('daily_engagement_logs');

    // 2. Initial State
    let stats = getEngagementStats('2026-08-10', db);
    expect(stats.state.totalXp).toBe(0);
    expect(stats.levelInfo.level).toBe(1);
    expect(stats.state.currentStreak).toBe(0);

    // 3. Task Creation & Completion
    const task = createTask(
      { title: 'Task 1', date: '2026-08-10', scheduledTime: '10:00' },
      db,
    );
    expect(task.isCompleted).toBe(false);

    updateTask({ id: task.id, isCompleted: true }, db);
    stats = recalculateEngagementState('2026-08-10', db);

    // XP & Level update
    expect(stats.state.totalXp).toBeGreaterThan(0);
    expect(stats.levelInfo.level).toBeGreaterThanOrEqual(1);

    // 4. Streak
    const yesterdayTask = createTask({ title: 'Task Yesterday', date: '2026-08-09' }, db);
    updateTask({ id: yesterdayTask.id, isCompleted: true }, db);
    stats = recalculateEngagementState('2026-08-10', db);
    expect(stats.state.currentStreak).toBe(2);

    // 5. Achievements
    const achievements = getAchievementProgressList(db);
    expect(achievements.length).toBeGreaterThanOrEqual(8);
    const unlocked = achievements.filter((a) => a.isUnlocked);
    expect(unlocked.length).toBeGreaterThan(0);

    // 6. Persistence check
    const stateInDb = getUserEngagementState(db);
    expect(stateInDb.totalXp).toBe(stats.state.totalXp);
    expect(stateInDb.currentStreak).toBe(2);

    db.close();
  });
});
