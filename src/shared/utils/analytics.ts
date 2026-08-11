import type { Task } from '../types/task';
import type { UserEngagementState, DailyEngagementLog } from '../types/engagement';
import type {
  AnalyticsTimeRange,
  AnalyticsReport,
  ProductivityOverview,
  DailyAnalyticsPoint,
  ProductivityPatterns,
  ProductivityInsight,
} from '../types/analytics';
import {
  shiftDateString,
  createLocalDate,
  parseDateParts,
  classifyTask,
} from './date';

export function resolveDateRange(
  range: AnalyticsTimeRange,
  referenceDateStr: string,
): { startDate: string; endDate: string; dates: string[] } {
  let startDate = referenceDateStr;
  const endDate = referenceDateStr;

  if (range === '7d') {
    startDate = shiftDateString(referenceDateStr, -6);
  } else if (range === '30d') {
    startDate = shiftDateString(referenceDateStr, -29);
  } else if (range === 'month') {
    const { year, month } = parseDateParts(referenceDateStr);
    const monthStr = String(month).padStart(2, '0');
    startDate = `${year}-${monthStr}-01`;
  }

  const dates: string[] = [];
  let curr = startDate;
  while (curr <= endDate) {
    dates.push(curr);
    curr = shiftDateString(curr, 1);
  }

  return { startDate, endDate, dates };
}

export function getDayOfWeekName(dateStr: string): string {
  const date = createLocalDate(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function getFullDayOfWeekName(dateStr: string): string {
  const date = createLocalDate(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export interface FocusSessionRaw {
  id: string;
  taskId: string | null;
  date: string;
  durationSeconds: number;
  completedAt: string;
}

export function generateAnalyticsReport(
  tasks: Task[],
  dailyLogs: DailyEngagementLog[],
  focusSessions: FocusSessionRaw[],
  userEngagement: UserEngagementState,
  range: AnalyticsTimeRange,
  referenceDateStr: string,
  _priorPeriodTasks: Task[] = [],
  priorPeriodFocusSessions: FocusSessionRaw[] = [],
): AnalyticsReport {
  const { startDate, endDate, dates } = resolveDateRange(range, referenceDateStr);

  const logsByDate = new Map<string, DailyEngagementLog>();
  for (const log of dailyLogs) {
    logsByDate.set(log.date, log);
  }

  const focusByDate = new Map<string, number>();
  for (const fs of focusSessions) {
    const minutes = Math.floor(fs.durationSeconds / 60);
    focusByDate.set(fs.date, (focusByDate.get(fs.date) || 0) + minutes);
  }

  const tasksByDate = new Map<string, Task[]>();
  for (const task of tasks) {
    const existing = tasksByDate.get(task.date) || [];
    existing.push(task);
    tasksByDate.set(task.date, existing);
  }

  // Overview metrics
  const tasksCreated = tasks.length;
  const completedTasksList = tasks.filter((t) => t.isCompleted);
  const tasksCompleted = completedTasksList.length;
  const completionRate =
    tasksCreated > 0 ? Math.round((tasksCompleted / tasksCreated) * 100) : 0;

  const scheduledTasks = tasks.filter((t) => t.scheduledTime && t.scheduledTime.trim() !== '');
  const scheduledCount = scheduledTasks.length;
  const unscheduledCount = tasksCreated - scheduledCount;

  const overdueCount = tasks.filter(
    (t) => classifyTask(t, referenceDateStr, '23:59') === 'overdue',
  ).length;

  const totalFocusMinutes = focusSessions.reduce(
    (sum, fs) => sum + Math.floor(fs.durationSeconds / 60),
    0,
  );

  const xpEarned = dailyLogs.reduce((sum, l) => sum + (l.xpEarned || 0), 0);

  const overview: ProductivityOverview = {
    tasksCreated,
    tasksCompleted,
    completionRate,
    scheduledCount,
    unscheduledCount,
    overdueCount,
    totalFocusMinutes,
    xpEarned,
    currentStreak: userEngagement.currentStreak,
    longestStreak: userEngagement.longestStreak,
  };

  // Daily series points
  const dailySeries: DailyAnalyticsPoint[] = dates.map((dateStr) => {
    const dateTasks = tasksByDate.get(dateStr) || [];
    const dateCreated = dateTasks.length;
    const dateCompleted = dateTasks.filter((t) => t.isCompleted).length;
    const dateCompRate = dateCreated > 0 ? Math.round((dateCompleted / dateCreated) * 100) : 0;

    const log = logsByDate.get(dateStr);
    const focusMins = focusByDate.get(dateStr) || 0;
    const xp = log?.xpEarned || 0;
    const perfect = log?.isPerfectDay || false;

    return {
      date: dateStr,
      dayOfWeek: getDayOfWeekName(dateStr),
      tasksCreated: dateCreated,
      tasksCompleted: dateCompleted,
      completionRate: dateCompRate,
      focusMinutes: focusMins,
      xpEarned: xp,
      isPerfectDay: perfect,
    };
  });

  // Patterns
  // 1. Most productive day of week (Only if tasksCompleted >= 3)
  const dayCounts = new Map<string, number>();
  for (const t of completedTasksList) {
    const dayName = getFullDayOfWeekName(t.date);
    dayCounts.set(dayName, (dayCounts.get(dayName) || 0) + 1);
  }

  let mostProductiveDayOfWeek: { day: string; count: number } | null = null;
  if (tasksCompleted >= 3) {
    let maxDay = '';
    let maxCount = 0;
    for (const [day, count] of dayCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        maxDay = day;
      }
    }
    if (maxCount > 0) {
      mostProductiveDayOfWeek = { day: maxDay, count: maxCount };
    }
  }

  // 2. Peak focus hour (Only if focusSessions.length >= 3)
  const hourCounts = new Map<number, number>();
  for (const fs of focusSessions) {
    if (fs.completedAt) {
      const dateObj = new Date(fs.completedAt);
      if (!isNaN(dateObj.getTime())) {
        const hour = dateObj.getHours();
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      }
    }
  }

  let peakFocusHour: { hour: number; formattedHour: string } | null = null;
  if (focusSessions.length >= 3) {
    let maxHour = -1;
    let maxVal = 0;
    for (const [h, count] of hourCounts.entries()) {
      if (count > maxVal) {
        maxVal = count;
        maxHour = h;
      }
    }
    if (maxHour >= 0) {
      const period = maxHour >= 12 ? 'PM' : 'AM';
      const displayH = maxHour % 12 === 0 ? 12 : maxHour % 12;
      peakFocusHour = {
        hour: maxHour,
        formattedHour: `${displayH}:00 ${period}`,
      };
    }
  }

  const scheduledCompletedCount = scheduledTasks.filter((t) => t.isCompleted).length;
  const unscheduledTasks = tasks.filter((t) => !t.scheduledTime || t.scheduledTime.trim() === '');
  const unscheduledCompletedCount = unscheduledTasks.filter((t) => t.isCompleted).length;

  const scheduledCompletionRate =
    scheduledCount > 0 ? Math.round((scheduledCompletedCount / scheduledCount) * 100) : 0;
  const unscheduledCompletionRate =
    unscheduledCount > 0
      ? Math.round((unscheduledCompletedCount / unscheduledCount) * 100)
      : 0;

  const overdueRate =
    scheduledCount > 0 ? Math.round((overdueCount / scheduledCount) * 100) : 0;

  const patterns: ProductivityPatterns = {
    mostProductiveDayOfWeek,
    peakFocusHour,
    scheduledCompletionRate,
    unscheduledCompletionRate,
    overdueRate,
  };

  // Deterministic Insights
  const insights: ProductivityInsight[] = [];

  if (tasksCreated === 0) {
    insights.push({
      id: 'ins-empty',
      category: 'completion',
      title: 'Ready for Takeoff',
      description: 'Create and complete tasks to start generating personalized productivity insights.',
      trend: 'neutral',
    });
  } else {
    // High Completion Insight
    if (completionRate >= 80 && tasksCreated >= 5) {
      insights.push({
        id: 'ins-high-completion',
        category: 'completion',
        title: 'High Completion Efficiency',
        description: `You completed ${completionRate}% of all created tasks during this period. Great execution!`,
        trend: 'positive',
      });
    }

    // Best Day Insight
    if (mostProductiveDayOfWeek) {
      insights.push({
        id: 'ins-best-day',
        category: 'pattern',
        title: 'Peak Productivity Day',
        description: `${mostProductiveDayOfWeek.day} is your most active day, with ${mostProductiveDayOfWeek.count} completed task(s).`,
        trend: 'positive',
      });
    }

    // Focus Session Comparison Insight
    if (priorPeriodFocusSessions.length > 0 || totalFocusMinutes > 0) {
      const priorFocusMins = priorPeriodFocusSessions.reduce(
        (sum, fs) => sum + Math.floor(fs.durationSeconds / 60),
        0,
      );

      if (priorFocusMins > 0) {
        const diffPercent = Math.round(
          ((totalFocusMinutes - priorFocusMins) / priorFocusMins) * 100,
        );
        if (diffPercent > 0) {
          insights.push({
            id: 'ins-focus-growth',
            category: 'focus',
            title: 'Focus Time Growth',
            description: `Your logged focus time increased by ${diffPercent}% compared to the prior period.`,
            trend: 'positive',
          });
        }
      }
    }

    // Streak Insight
    if (userEngagement.currentStreak >= 3) {
      insights.push({
        id: 'ins-streak-momentum',
        category: 'streak',
        title: 'Strong Streak Momentum',
        description: `You've maintained an active ${userEngagement.currentStreak}-day streak!`,
        trend: 'positive',
      });
    }

    // Overdue Alert Insight
    if (overdueRate >= 20 && scheduledCount >= 5) {
      insights.push({
        id: 'ins-overdue-warning',
        category: 'scheduling',
        title: 'Schedule Realism Opportunity',
        description: `${overdueRate}% of scheduled tasks became overdue. Try scheduling fewer tasks per day or adjusting times.`,
        trend: 'negative',
      });
    }
  }

  return {
    timeRange: range,
    startDate,
    endDate,
    overview,
    dailySeries,
    patterns,
    insights,
  };
}
