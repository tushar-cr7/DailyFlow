import { Notification } from 'electron';
import type Database from 'better-sqlite3';
import type { Task } from '../../shared/types/task';
import type { NotificationType } from '../../shared/types/notifications';
import {
  calculateReminderTime,
  isReminderEligible,
} from '../../shared/utils/notifications';
import { getTodayString, getCurrentTimeString } from '../../shared/utils/date';
import {
  getNotificationSettings,
  isNotificationSent,
  logNotificationSent,
} from '../database/notificationRepository';
import { getAllTasks, getTaskById } from '../database/taskRepository';

class NotificationSchedulerService {
  private timerMap = new Map<string, NodeJS.Timeout>();
  private tickInterval: NodeJS.Timeout | null = null;
  private dbRef: Database.Database | null = null;

  public init(customDb?: Database.Database): void {
    if (customDb) {
      this.dbRef = customDb;
    }

    this.rescheduleAll();

    // 60-second periodic background tick for sleep/wake resync & daily events
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
    }
    this.tickInterval = setInterval(() => {
      this.onPeriodicTick();
    }, 60000);
  }

  public destroy(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    for (const handle of this.timerMap.values()) {
      clearTimeout(handle);
    }
    this.timerMap.clear();
  }

  public rescheduleAll(): void {
    // Clear existing task timers
    for (const handle of this.timerMap.values()) {
      clearTimeout(handle);
    }
    this.timerMap.clear();

    const settings = getNotificationSettings(this.dbRef || undefined);
    if (!settings.enabled || !settings.taskRemindersEnabled) {
      return;
    }

    const todayStr = getTodayString();
    const tasks = getAllTasks({ date: todayStr, isCompleted: false }, this.dbRef || undefined);

    const now = new Date();
    for (const task of tasks) {
      this.scheduleTaskReminder(task, now);
    }
  }

  public rescheduleTask(taskId: string): void {
    this.cancelTaskTimer(taskId);

    const task = getTaskById(taskId, this.dbRef || undefined);
    if (!task) return;

    const settings = getNotificationSettings(this.dbRef || undefined);
    if (!settings.enabled || !settings.taskRemindersEnabled) return;

    this.scheduleTaskReminder(task, new Date());
  }

  public cancelTaskTimer(taskId: string): void {
    const existing = this.timerMap.get(taskId);
    if (existing) {
      clearTimeout(existing);
      this.timerMap.delete(taskId);
    }
  }

  private scheduleTaskReminder(task: Task, referenceTime: Date): void {
    const settings = getNotificationSettings(this.dbRef || undefined);
    if (!isReminderEligible(task, settings, referenceTime)) {
      return;
    }

    const reminderTime = calculateReminderTime(
      task.date,
      task.scheduledTime,
      settings.taskReminderLeadMinutes,
    );

    if (!reminderTime) return;

    const delayMs = reminderTime.getTime() - referenceTime.getTime();
    if (delayMs <= 0) return;

    const refId = `${task.id}-${task.date}-${task.scheduledTime}`;
    if (isNotificationSent('task_reminder', refId, this.dbRef || undefined)) {
      return;
    }

    const handle = setTimeout(() => {
      this.dispatchTaskNotification(task, refId);
      this.timerMap.delete(task.id);
    }, delayMs);

    this.timerMap.set(task.id, handle);
  }

  private dispatchTaskNotification(task: Task, refId: string): void {
    const settings = getNotificationSettings(this.dbRef || undefined);
    if (!settings.enabled || !settings.taskRemindersEnabled) return;

    this.sendNotification(
      `Reminder: ${task.title}`,
      `Scheduled for ${task.scheduledTime || 'today'}. Time to focus!`,
      'task_reminder',
      refId,
    );
  }

  public sendNotification(
    title: string,
    body: string,
    type: NotificationType,
    referenceId: string,
  ): boolean {
    const settings = getNotificationSettings(this.dbRef || undefined);
    if (!settings.enabled) return false;

    if (isNotificationSent(type, referenceId, this.dbRef || undefined)) {
      return false;
    }

    if (Notification.isSupported()) {
      const notif = new Notification({ title, body });
      notif.show();
    }

    logNotificationSent(type, referenceId, this.dbRef || undefined);
    return true;
  }

  private onPeriodicTick(): void {
    const settings = getNotificationSettings(this.dbRef || undefined);
    if (!settings.enabled) return;

    const todayStr = getTodayString();
    const currentTimeStr = getCurrentTimeString();

    // 1. Check Daily Briefing Reminder
    if (settings.dailyBriefingReminderEnabled) {
      if (currentTimeStr >= settings.dailyBriefingTime) {
        const refId = `briefing-${todayStr}`;
        if (!isNotificationSent('daily_briefing', refId, this.dbRef || undefined)) {
          this.sendNotification(
            'DailyFlow Morning Briefing',
            "Start your day with focus! Check today's priorities.",
            'daily_briefing',
            refId,
          );
        }
      }
    }

    // 2. Check Daily Summary Reminder
    if (settings.dailySummaryReminderEnabled) {
      if (currentTimeStr >= settings.dailySummaryTime) {
        const refId = `summary-${todayStr}`;
        if (!isNotificationSent('daily_summary', refId, this.dbRef || undefined)) {
          this.sendNotification(
            'DailyFlow Evening Review',
            'Time to review your progress and write your daily reflection.',
            'daily_summary',
            refId,
          );
        }
      }
    }
  }
}

export const notificationScheduler = new NotificationSchedulerService();
