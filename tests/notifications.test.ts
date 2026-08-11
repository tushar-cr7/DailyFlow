import { describe, it, expect } from 'vitest';
import {
  calculateReminderTime,
  isReminderEligible,
  buildDeduplicationKey,
} from '../src/shared/utils/notifications';
import type { Task } from '../src/shared/types/task';
import type { NotificationSettings } from '../src/shared/types/notifications';

describe('Notification Rules Engine & Time Calculations', () => {
  const defaultSettings: NotificationSettings = {
    enabled: true,
    taskRemindersEnabled: true,
    taskReminderLeadMinutes: 5,
    overdueRemindersEnabled: true,
    dailyBriefingReminderEnabled: true,
    dailyBriefingTime: '09:00',
    dailySummaryReminderEnabled: true,
    dailySummaryTime: '18:00',
    focusRemindersEnabled: true,
    updatedAt: '2026-08-11T12:00:00Z',
  };

  it('calculates reminder lead time correctly', () => {
    const reminderTime = calculateReminderTime('2026-08-11', '10:00', 5);
    expect(reminderTime).not.toBeNull();
    // 10:00 minus 5 minutes = 09:55
    expect(reminderTime?.getHours()).toBe(9);
    expect(reminderTime?.getMinutes()).toBe(55);
  });

  it('returns null for invalid time or date inputs', () => {
    expect(calculateReminderTime('invalid-date', '10:00', 5)).toBeNull();
    expect(calculateReminderTime('2026-08-11', null, 5)).toBeNull();
    expect(calculateReminderTime('2026-08-11', '25:99', 5)).toBeNull();
  });

  it('correctly evaluates reminder eligibility for future tasks', () => {
    const task: Task = {
      id: 't-future',
      title: 'Future Meeting',
      description: null,
      date: '2026-08-11',
      scheduledTime: '14:00',
      isCompleted: false,
      createdAt: '2026-08-11T09:00:00Z',
      updatedAt: '2026-08-11T09:00:00Z',
    };

    // Reference time: 2026-08-11 10:00 AM
    const referenceTime = new Date(2026, 7, 11, 10, 0, 0);
    expect(isReminderEligible(task, defaultSettings, referenceTime)).toBe(true);
  });

  it('rejects reminder eligibility for completed tasks or past times', () => {
    const completedTask: Task = {
      id: 't-completed',
      title: 'Done Task',
      description: null,
      date: '2026-08-11',
      scheduledTime: '14:00',
      isCompleted: true,
      createdAt: '2026-08-11T09:00:00Z',
      updatedAt: '2026-08-11T09:00:00Z',
    };

    const referenceTime = new Date(2026, 7, 11, 10, 0, 0);
    expect(isReminderEligible(completedTask, defaultSettings, referenceTime)).toBe(false);

    // Disabled master settings
    const disabledSettings = { ...defaultSettings, enabled: false };
    expect(isReminderEligible(completedTask, disabledSettings, referenceTime)).toBe(false);
  });

  it('generates consistent deduplication keys', () => {
    const key = buildDeduplicationKey('task_reminder', 't-100');
    expect(key).toBe('task_reminder:t-100');
  });
});
