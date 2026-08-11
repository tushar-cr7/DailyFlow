import type { Task } from '../types/task';
import type { NotificationSettings, NotificationType } from '../types/notifications';
import { parseDateParts, isValidDateString, isValidTimeString } from './date';

export function calculateReminderTime(
  dateStr: string,
  timeStr: string | null,
  leadMinutes: number,
): Date | null {
  if (!timeStr || !isValidDateString(dateStr) || !isValidTimeString(timeStr)) {
    return null;
  }

  const { year, month, day } = parseDateParts(dateStr);
  const [hours, minutes] = timeStr.split(':').map(Number);

  const targetDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
  const reminderMs = targetDate.getTime() - leadMinutes * 60 * 1000;

  return new Date(reminderMs);
}

export function isReminderEligible(
  task: Task,
  settings: NotificationSettings,
  referenceTime: Date = new Date(),
): boolean {
  if (!settings.enabled || !settings.taskRemindersEnabled) {
    return false;
  }
  if (task.isCompleted || !task.scheduledTime) {
    return false;
  }

  const reminderTime = calculateReminderTime(
    task.date,
    task.scheduledTime,
    settings.taskReminderLeadMinutes,
  );

  if (!reminderTime) {
    return false;
  }

  return reminderTime.getTime() > referenceTime.getTime();
}

export function buildDeduplicationKey(type: NotificationType, referenceId: string): string {
  return `${type}:${referenceId}`;
}
