import type { ScheduleStatus } from '../types/task';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidDateString(dateStr: string): boolean {
  if (!DATE_REGEX.test(dateStr)) return false;
  const parts = parseDateParts(dateStr);
  const date = new Date(parts.year, parts.month - 1, parts.day);
  return (
    date.getFullYear() === parts.year &&
    date.getMonth() === parts.month - 1 &&
    date.getDate() === parts.day
  );
}

export function isValidTimeString(timeStr: string): boolean {
  return TIME_REGEX.test(timeStr);
}

export function parseDateParts(dateStr: string): { year: number; month: number; day: number } {
  const parts = dateStr.split('-').map(Number);
  return {
    year: parts[0] ?? 2026,
    month: parts[1] ?? 1,
    day: parts[2] ?? 1,
  };
}

export function createLocalDate(dateStr: string): Date {
  const { year, month, day } = parseDateParts(dateStr);
  return new Date(year, month - 1, day);
}

export function getTodayString(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(now: Date = new Date()): string {
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function shiftDateString(dateStr: string, days: number): string {
  const date = createLocalDate(dateStr);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr: string, todayStr: string = getTodayString()): string {
  if (dateStr === todayStr) {
    return 'Today';
  }
  const tomorrowStr = shiftDateString(todayStr, 1);
  if (dateStr === tomorrowStr) {
    return 'Tomorrow';
  }
  const yesterdayStr = shiftDateString(todayStr, -1);
  if (dateStr === yesterdayStr) {
    return 'Yesterday';
  }

  const { year, month, day } = parseDateParts(dateStr);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Pure, deterministic classification of task schedule status.
 * Receives explicit currentDateStr and currentTimeStr. No hidden Date.now() calls.
 */
export function classifyTask(
  task: { isCompleted: boolean; date: string; scheduledTime: string | null },
  currentDateStr: string,
  currentTimeStr: string,
): ScheduleStatus {
  // 1. Completed Rule
  if (task.isCompleted) {
    return 'completed';
  }

  // 2. Unscheduled Rule (scheduledTime is null/empty)
  if (!task.scheduledTime) {
    return 'unscheduled';
  }

  // 3. Overdue Rule (Incomplete + Scheduled + Past Date/Time)
  const isPastDate = task.date < currentDateStr;
  const isSameDatePastTime = task.date === currentDateStr && task.scheduledTime < currentTimeStr;
  if (isPastDate || isSameDatePastTime) {
    return 'overdue';
  }

  // 4. Today Rule
  if (task.date === currentDateStr) {
    return 'today';
  }

  // 5. Upcoming Rule (+1d through +7d from tomorrow)
  const tomorrowStr = shiftDateString(currentDateStr, 1);
  const sevenDaysEndStr = shiftDateString(currentDateStr, 7);
  if (task.date >= tomorrowStr && task.date <= sevenDaysEndStr) {
    return 'upcoming';
  }

  // 6. Future Rule (+8d and beyond)
  return 'future';
}
