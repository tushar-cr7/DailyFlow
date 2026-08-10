import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations } from '../src/main/database/schema';
import { createTask, updateTask } from '../src/main/database/taskRepository';
import {
  getUserEngagementState,
  getEngagementStats,
  recalculateEngagementState,
  getAchievementProgressList,
} from '../src/main/database/engagementRepository';

describe('Engagement Repository & SQLite Integration (Phase 7)', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    runMigrations(db);
  });

  afterEach(() => {
    if (db) {
      db.close();
    }
  });

  it('initializes engagement tables with Migration 002', () => {
    const columns = db
      .prepare("PRAGMA table_info('user_engagement')")
      .all() as { name: string }[];
    const colNames = columns.map((c) => c.name);

    expect(colNames).toContain('id');
    expect(colNames).toContain('total_xp');
    expect(colNames).toContain('current_level');
    expect(colNames).toContain('current_streak');
    expect(colNames).toContain('longest_streak');
    expect(colNames).toContain('perfect_days_count');

    const state = getUserEngagementState(db);
    expect(state.totalXp).toBe(0);
    expect(state.currentLevel).toBe(1);
    expect(state.currentStreak).toBe(0);
  });

  it('recalculates engagement stats upon completing a task', () => {
    const task = createTask(
      {
        title: 'Morning Workout',
        date: '2026-08-10',
        scheduledTime: '08:00',
      },
      db,
    );

    // Initial stats (task created but not completed)
    let stats = getEngagementStats('2026-08-10', db);
    expect(stats.state.totalXp).toBe(0);
    expect(stats.state.currentStreak).toBe(0);

    // Complete the scheduled task (+15 XP for task completion + +5 XP daily milestone 1st task + +50 XP perfect day + +20 XP first_step achievement bonus = 90 XP total)
    updateTask({ id: task.id, isCompleted: true }, db);
    stats = recalculateEngagementState('2026-08-10', db);

    expect(stats.state.totalXp).toBeGreaterThan(0);
    expect(stats.state.currentStreak).toBe(1);
    expect(stats.state.perfectDaysCount).toBe(1);

    const firstStepAchievement = stats.achievements.find((a) => a.id === 'first_step');
    expect(firstStepAchievement?.isUnlocked).toBe(true);
  });

  it('correctly tracks multi-day streaks in database logs', () => {
    // Day 1: Aug 9
    const t1 = createTask({ title: 'Task Aug 9', date: '2026-08-09' }, db);
    updateTask({ id: t1.id, isCompleted: true }, db);

    // Day 2: Aug 10
    const t2 = createTask({ title: 'Task Aug 10', date: '2026-08-10' }, db);
    updateTask({ id: t2.id, isCompleted: true }, db);

    const stats = recalculateEngagementState('2026-08-10', db);
    expect(stats.state.currentStreak).toBe(2);
    expect(stats.state.longestStreak).toBe(2);
  });

  it('returns default achievements list via getAchievementProgressList', () => {
    const achievements = getAchievementProgressList(db);
    expect(achievements.length).toBeGreaterThanOrEqual(8);
    expect(achievements.some((a) => a.id === 'first_step')).toBe(true);
    expect(achievements.some((a) => a.id === 'streak_3')).toBe(true);
  });
});
