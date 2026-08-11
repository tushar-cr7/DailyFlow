import type Database from 'better-sqlite3';
import { getDatabase } from './connection';
import type { DailyEngagementLog } from '../../shared/types/engagement';
import type { AnalyticsQueryDTO, AnalyticsReport } from '../../shared/types/analytics';
import {
  resolveDateRange,
  generateAnalyticsReport,
  type FocusSessionRaw,
} from '../../shared/utils/analytics';
import { getTodayString, shiftDateString } from '../../shared/utils/date';
import { getUserEngagementState } from './engagementRepository';
import { getAllTasks } from './taskRepository';

interface DailyLogDbRow {
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

interface FocusSessionDbRow {
  id: string;
  task_id: string | null;
  date: string;
  duration_seconds: number;
  completed_at: string;
  created_at: string;
}

export function getAnalyticsReport(
  dto?: AnalyticsQueryDTO,
  customDb?: Database.Database,
): AnalyticsReport {
  const db = customDb || getDatabase();
  const range = dto?.range || '7d';
  const referenceDateStr = dto?.referenceDate || getTodayString();

  const { startDate, endDate, dates } = resolveDateRange(range, referenceDateStr);

  // 1. Fetch current range tasks
  const tasks = getAllTasks({ startDate, endDate }, db);

  // 2. Fetch daily logs in current range
  const logRows = db
    .prepare(
      `SELECT * FROM daily_engagement_logs WHERE date >= ? AND date <= ? ORDER BY date ASC`,
    )
    .all(startDate, endDate) as DailyLogDbRow[];

  const dailyLogs: DailyEngagementLog[] = logRows.map((r) => ({
    date: r.date,
    tasksScheduled: r.tasks_scheduled,
    tasksCompleted: r.tasks_completed,
    isPerfectDay: r.is_perfect_day === 1,
    xpEarned: r.xp_earned,
    updatedAt: r.date,
    total_focus_minutes: r.total_focus_minutes,
  }));

  // 3. Fetch focus sessions in current range
  const focusRows = db
    .prepare(`SELECT * FROM focus_sessions WHERE date >= ? AND date <= ?`)
    .all(startDate, endDate) as FocusSessionDbRow[];

  const focusSessions: FocusSessionRaw[] = focusRows.map((f) => ({
    id: f.id,
    taskId: f.task_id,
    date: f.date,
    durationSeconds: f.duration_seconds,
    completedAt: f.completed_at,
  }));

  // 4. Fetch prior period data for growth comparison
  const daysInPeriod = dates.length;
  const priorEndDate = shiftDateString(startDate, -1);
  const priorStartDate = shiftDateString(priorEndDate, -(daysInPeriod - 1));

  const priorTasks = getAllTasks({ startDate: priorStartDate, endDate: priorEndDate }, db);

  const priorFocusRows = db
    .prepare(`SELECT * FROM focus_sessions WHERE date >= ? AND date <= ?`)
    .all(priorStartDate, priorEndDate) as FocusSessionDbRow[];

  const priorFocusSessions: FocusSessionRaw[] = priorFocusRows.map((f) => ({
    id: f.id,
    taskId: f.task_id,
    date: f.date,
    durationSeconds: f.duration_seconds,
    completedAt: f.completed_at,
  }));

  // 5. User Engagement state
  const userEngagement = getUserEngagementState(db);

  return generateAnalyticsReport(
    tasks,
    dailyLogs,
    focusSessions,
    userEngagement,
    range,
    referenceDateStr,
    priorTasks,
    priorFocusSessions,
  );
}
