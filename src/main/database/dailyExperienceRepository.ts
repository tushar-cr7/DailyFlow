import type Database from 'better-sqlite3';
import { getDatabase } from './connection';
import type {
  DailyBriefing,
  DailySummary,
  FocusSession,
  LogFocusSessionDTO,
} from '../../shared/types/dailyExperience';
import { buildDailyBriefing } from '../../shared/utils/dailyExperience';
import { getTodayString } from '../../shared/utils/date';
import { recalculateEngagementState } from './engagementRepository';
import { getAllTasks, getTaskById } from './taskRepository';

interface DailyLogExtRow {
  date: string;
  tasks_scheduled: number;
  tasks_completed: number;
  is_perfect_day: number;
  xp_earned: number;
  primary_task_id: string | null;
  daily_reflection: string | null;
  total_focus_minutes: number;
  is_summary_reviewed: number;
}

export function setPrimaryFocus(
  taskId: string | null,
  dateStr: string = getTodayString(),
  customDb?: Database.Database,
): void {
  const db = customDb || getDatabase();

  if (taskId) {
    const task = getTaskById(taskId, db);
    if (!task) {
      throw new Error(`Task with id "${taskId}" not found.`);
    }
  }

  // Ensure row exists in daily_engagement_logs
  db.prepare(`
    INSERT INTO daily_engagement_logs (date, tasks_scheduled, tasks_completed, is_perfect_day, xp_earned, primary_task_id, updated_at)
    VALUES (?, 0, 0, 0, 0, ?, datetime('now'))
    ON CONFLICT(date) DO UPDATE SET
      primary_task_id = excluded.primary_task_id,
      updated_at = datetime('now')
  `).run(dateStr, taskId);
}

export function getDailyBriefing(
  dateStr: string = getTodayString(),
  customDb?: Database.Database,
): DailyBriefing {
  const db = customDb || getDatabase();

  const todayTasks = getAllTasks({ date: dateStr }, db);
  const overdueTasks = getAllTasks({ overdueOnly: true, isCompleted: false }, db);

  const engagement = recalculateEngagementState(dateStr, db);

  const logRow = db
    .prepare('SELECT primary_task_id FROM daily_engagement_logs WHERE date = ?')
    .get(dateStr) as { primary_task_id: string | null } | undefined;

  const primaryTaskId = logRow?.primary_task_id || null;

  return buildDailyBriefing(
    todayTasks,
    overdueTasks,
    primaryTaskId,
    engagement.state.currentStreak,
    engagement.todayLog.isPerfectDay,
    dateStr,
  );
}

export function logFocusSession(
  dto: LogFocusSessionDTO,
  customDb?: Database.Database,
): FocusSession {
  const db = customDb || getDatabase();
  const dateStr = dto.date || getTodayString();
  const id = `focus-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const nowIso = new Date().toISOString();

  let validTaskId: string | null = null;
  if (dto.taskId) {
    const existing = getTaskById(dto.taskId, db);
    if (existing) {
      validTaskId = dto.taskId;
    }
  }

  const focusMinutes = Math.max(1, Math.floor(dto.durationSeconds / 60));

  const logTx = db.transaction(() => {
    // 1. Insert into focus_sessions
    db.prepare(`
      INSERT INTO focus_sessions (id, task_id, date, duration_seconds, completed_at, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run(id, validTaskId, dateStr, dto.durationSeconds, nowIso);

    // 2. Ensure log row exists & update total_focus_minutes
    db.prepare(`
      INSERT INTO daily_engagement_logs (date, tasks_scheduled, tasks_completed, is_perfect_day, xp_earned, total_focus_minutes, updated_at)
      VALUES (?, 0, 0, 0, 0, ?, datetime('now'))
      ON CONFLICT(date) DO UPDATE SET
        total_focus_minutes = total_focus_minutes + excluded.total_focus_minutes,
        updated_at = datetime('now')
    `).run(dateStr, focusMinutes);
  });

  logTx();

  // 3. Recalculate engagement (which adds focus session XP)
  recalculateEngagementState(dateStr, db);

  return {
    id,
    taskId: validTaskId,
    date: dateStr,
    durationSeconds: dto.durationSeconds,
    completedAt: nowIso,
    createdAt: nowIso,
  };
}

export function saveDailyReflection(
  reflection: string,
  dateStr: string = getTodayString(),
  customDb?: Database.Database,
): void {
  const db = customDb || getDatabase();

  db.prepare(`
    INSERT INTO daily_engagement_logs (date, tasks_scheduled, tasks_completed, is_perfect_day, xp_earned, daily_reflection, is_summary_reviewed, updated_at)
    VALUES (?, 0, 0, 0, 0, ?, 1, datetime('now'))
    ON CONFLICT(date) DO UPDATE SET
      daily_reflection = excluded.daily_reflection,
      is_summary_reviewed = 1,
      updated_at = datetime('now')
  `).run(dateStr, reflection);
}

export function getDailySummary(
  dateStr: string = getTodayString(),
  customDb?: Database.Database,
): DailySummary {
  const db = customDb || getDatabase();
  const engagement = recalculateEngagementState(dateStr, db);

  const row = db
    .prepare('SELECT * FROM daily_engagement_logs WHERE date = ?')
    .get(dateStr) as DailyLogExtRow | undefined;

  const todayTasks = getAllTasks({ date: dateStr }, db);

  const totalScheduled = todayTasks.length;
  const completedCount = todayTasks.filter((t) => t.isCompleted).length;

  return {
    date: dateStr,
    totalScheduled,
    completedCount,
    totalFocusMinutes: row?.total_focus_minutes || 0,
    xpEarned: engagement.todayLog.xpEarned,
    isPerfectDay: engagement.todayLog.isPerfectDay,
    reflection: row?.daily_reflection || null,
    isSummaryReviewed: row?.is_summary_reviewed === 1,
    engagement,
  };
}
