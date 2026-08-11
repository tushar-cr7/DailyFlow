import type { Task } from '../types/task';
import type { DailyBriefing, PaceStatus } from '../types/dailyExperience';

export const FOCUS_SESSION_XP = 15; // XP awarded per completed focus session

const MOTIVATIONAL_QUOTES = [
  "Small daily steps lead to massive annual achievements.",
  "Focus on progress, not perfection.",
  "Your future is created by what you do today, not tomorrow.",
  "One task at a time. Stay in the flow.",
  "Consistency is what turns average into extraordinary.",
  "Finish today strong so tomorrow starts easy.",
];

export function getGreeting(hour: number = new Date().getHours()): string {
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

export function getMotivationalQuote(streak: number = 0, isPerfectDay: boolean = false): string {
  if (isPerfectDay) {
    return "Outstanding work! You've achieved a Perfect Day!";
  }
  if (streak > 3) {
    return `🔥 ${streak}-day streak! Keep the momentum going!`;
  }
  const index = Math.abs(streak) % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[index];
}

export function calculatePaceStatus(
  scheduledCount: number,
  completedCount: number,
  currentHour: number = new Date().getHours(),
): PaceStatus {
  if (scheduledCount === 0) {
    return 'on_track';
  }
  if (completedCount >= scheduledCount) {
    return 'completed';
  }

  // Workday window from 8:00 (hour 8) to 20:00 (hour 20)
  const dayStart = 8;
  const dayEnd = 20;
  const totalHours = dayEnd - dayStart;

  let elapsedHours = currentHour - dayStart;
  if (elapsedHours < 0) elapsedHours = 0;
  if (elapsedHours > totalHours) elapsedHours = totalHours;

  const expectedRatio = totalHours > 0 ? elapsedHours / totalHours : 0;
  const actualRatio = completedCount / scheduledCount;

  if (actualRatio >= expectedRatio + 0.1) {
    return 'ahead';
  }
  if (actualRatio >= expectedRatio - 0.15) {
    return 'on_track';
  }
  return 'needs_momentum';
}

export function buildDailyBriefing(
  todayTasks: Task[],
  overdueTasks: Task[],
  primaryFocusTaskId: string | null,
  streak: number,
  isPerfectDay: boolean,
  todayStr: string,
  currentHour: number = new Date().getHours(),
): DailyBriefing {
  const totalScheduled = todayTasks.length;
  const completedCount = todayTasks.filter((t) => t.isCompleted).length;
  const remainingCount = totalScheduled - completedCount;
  const overdueCount = overdueTasks.length;

  let primaryFocusTask = todayTasks.find((t) => t.id === primaryFocusTaskId) || null;
  if (!primaryFocusTask && primaryFocusTaskId) {
    // If the primary focus task was moved to another date or deleted
    primaryFocusTask = null;
  }

  const paceStatus = calculatePaceStatus(totalScheduled, completedCount, currentHour);
  const greeting = getGreeting(currentHour);
  const quote = getMotivationalQuote(streak, isPerfectDay);

  // Estimate 25 minutes per remaining task
  const estimatedMinutesRemaining = remainingCount * 25;
  // Estimate potential task XP (10 per unscheduled, 15 per scheduled task)
  const potentialXpRemaining = todayTasks
    .filter((t) => !t.isCompleted)
    .reduce((sum, t) => sum + (t.scheduledTime ? 15 : 10), 0);

  return {
    date: todayStr,
    greeting,
    quote,
    totalScheduled,
    completedCount,
    overdueCount,
    remainingCount,
    primaryFocusTask,
    paceStatus,
    estimatedMinutesRemaining,
    potentialXpRemaining,
    isPerfectDay,
  };
}
