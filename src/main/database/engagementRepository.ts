import type Database from 'better-sqlite3';
import { getDatabase } from './connection';
import type {
  UserEngagementState,
  DailyEngagementLog,
  AchievementProgress,
  EngagementStats,
} from '../../shared/types/engagement';
import {
  calculateDailyMilestoneXp,
  calculatePerfectDayXp,
  calculateLevelInfo,
  calculateStreak,
  evaluateAchievements,
} from '../../shared/utils/engagement';
import { getTodayString } from '../../shared/utils/date';

interface UserEngagementRow {
  id: number;
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  perfect_days_count: number;
  updated_at: string;
}

interface AchievementRow {
  id: string;
  progress: number;
  is_unlocked: number;
  unlocked_at: string | null;
  updated_at: string;
}

interface TaskSummaryRow {
  date: string;
  total_tasks: number;
  completed_tasks: number;
  scheduled_completed_tasks: number;
  unscheduled_completed_tasks: number;
}

export function getUserEngagementState(customDb?: Database.Database): UserEngagementState {
  const db = customDb || getDatabase();
  const row = db
    .prepare('SELECT * FROM user_engagement WHERE id = 1')
    .get() as UserEngagementRow | undefined;

  if (!row) {
    // Fallback default state
    return {
      totalXp: 0,
      currentLevel: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      perfectDaysCount: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    totalXp: row.total_xp,
    currentLevel: row.current_level,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastActiveDate: row.last_active_date,
    perfectDaysCount: row.perfect_days_count,
    updatedAt: row.updated_at,
  };
}

export function getAchievementProgressList(customDb?: Database.Database): AchievementProgress[] {
  const db = customDb || getDatabase();
  const rows = db.prepare('SELECT * FROM user_achievements').all() as AchievementRow[];
  const existingMap = new Map<string, { isUnlocked: boolean; unlockedAt: string | null }>();

  for (const row of rows) {
    existingMap.set(row.id, {
      isUnlocked: row.is_unlocked === 1,
      unlockedAt: row.unlocked_at,
    });
  }

  const state = getUserEngagementState(db);
  const totalCompletedRow = db
    .prepare('SELECT COUNT(*) as cnt FROM tasks WHERE is_completed = 1')
    .get() as { cnt: number };

  return evaluateAchievements({
    totalTasksCompleted: totalCompletedRow?.cnt || 0,
    currentStreak: state.currentStreak,
    perfectDaysCount: state.perfectDaysCount,
    existingUnlocked: existingMap,
  });
}

export function saveAchievementProgress(
  progressList: AchievementProgress[],
  customDb?: Database.Database,
): void {
  const db = customDb || getDatabase();
  const stmt = db.prepare(`
    INSERT INTO user_achievements (id, progress, is_unlocked, unlocked_at, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      progress = excluded.progress,
      is_unlocked = excluded.is_unlocked,
      unlocked_at = COALESCE(user_achievements.unlocked_at, excluded.unlocked_at),
      updated_at = datetime('now')
  `);

  const saveTx = db.transaction(() => {
    for (const item of progressList) {
      stmt.run(item.id, item.currentValue, item.isUnlocked ? 1 : 0, item.unlockedAt);
    }
  });

  saveTx();
}

export function recalculateEngagementState(
  todayStr: string = getTodayString(),
  customDb?: Database.Database,
): EngagementStats {
  const db = customDb || getDatabase();

  // 1. Group tasks by date to calculate per-day metrics
  const taskSummaries = db
    .prepare(`
      SELECT
        date,
        COUNT(*) as total_tasks,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN is_completed = 1 AND scheduled_time IS NOT NULL AND TRIM(scheduled_time) != '' THEN 1 ELSE 0 END) as scheduled_completed_tasks,
        SUM(CASE WHEN is_completed = 1 AND (scheduled_time IS NULL OR TRIM(scheduled_time) = '') THEN 1 ELSE 0 END) as unscheduled_completed_tasks
      FROM tasks
      GROUP BY date
      ORDER BY date ASC
    `)
    .all() as TaskSummaryRow[];

  let accumulatedXp = 0;
  let perfectDaysCount = 0;
  const activeDates: string[] = [];
  let todayLog: DailyEngagementLog = {
    date: todayStr,
    tasksScheduled: 0,
    tasksCompleted: 0,
    isPerfectDay: false,
    xpEarned: 0,
    updatedAt: new Date().toISOString(),
  };

  const syncLogsTx = db.transaction(() => {
    // Clear and rebuild daily logs for consistency
    db.prepare('DELETE FROM daily_engagement_logs').run();

    const insertLogStmt = db.prepare(`
      INSERT INTO daily_engagement_logs (date, tasks_scheduled, tasks_completed, is_perfect_day, xp_earned, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);

    for (const summary of taskSummaries) {
      const scheduledCount = summary.total_tasks;
      const completedCount = summary.completed_tasks;
      const scheduledCompleted = summary.scheduled_completed_tasks;
      const unscheduledCompleted = summary.unscheduled_completed_tasks;

      // Base task XP + scheduled bonus XP
      const taskXp = unscheduledCompleted * 10 + scheduledCompleted * 15;

      // Daily milestone XP
      const milestoneXp = calculateDailyMilestoneXp(completedCount);

      // Perfect day calculation
      const { isPerfect, xpBonus: perfectDayXp } = calculatePerfectDayXp(
        scheduledCount,
        completedCount,
      );

      const dayTotalXp = taskXp + milestoneXp + perfectDayXp;
      accumulatedXp += dayTotalXp;

      if (isPerfect) {
        perfectDaysCount++;
      }

      if (completedCount >= 1) {
        activeDates.push(summary.date);
      }

      const logItem: DailyEngagementLog = {
        date: summary.date,
        tasksScheduled: scheduledCount,
        tasksCompleted: completedCount,
        isPerfectDay: isPerfect,
        xpEarned: dayTotalXp,
        updatedAt: new Date().toISOString(),
      };

      if (summary.date === todayStr) {
        todayLog = logItem;
      }

      insertLogStmt.run(
        summary.date,
        scheduledCount,
        completedCount,
        isPerfect ? 1 : 0,
        dayTotalXp,
      );
    }
  });

  syncLogsTx();

  // Calculate streak & longest streak
  const { currentStreak, lastActiveDate } = calculateStreak(activeDates, todayStr);
  const existingState = getUserEngagementState(db);
  const longestStreak = Math.max(existingState.longestStreak, currentStreak);

  // Evaluate achievements and award achievement XP bonuses
  const achievementProgress = getAchievementProgressList(db);
  let achievementBonusXp = 0;
  for (const ach of achievementProgress) {
    if (ach.isUnlocked) {
      achievementBonusXp += ach.xpBonus;
    }
  }

  const finalTotalXp = accumulatedXp + achievementBonusXp;
  const levelInfo = calculateLevelInfo(finalTotalXp);

  // Update user_engagement table in SQLite
  db.prepare(`
    UPDATE user_engagement
    SET total_xp = ?,
        current_level = ?,
        current_streak = ?,
        longest_streak = ?,
        last_active_date = ?,
        perfect_days_count = ?,
        updated_at = datetime('now')
    WHERE id = 1
  `).run(
    finalTotalXp,
    levelInfo.level,
    currentStreak,
    longestStreak,
    lastActiveDate,
    perfectDaysCount,
  );

  // Save achievement state
  saveAchievementProgress(achievementProgress, db);

  const updatedState: UserEngagementState = {
    totalXp: finalTotalXp,
    currentLevel: levelInfo.level,
    currentStreak,
    longestStreak,
    lastActiveDate,
    perfectDaysCount,
    updatedAt: new Date().toISOString(),
  };

  return {
    state: updatedState,
    levelInfo,
    todayLog,
    achievements: achievementProgress,
  };
}

export function getEngagementStats(
  todayStr: string = getTodayString(),
  customDb?: Database.Database,
): EngagementStats {
  return recalculateEngagementState(todayStr, customDb);
}
