export type NotificationType =
  | 'task_reminder'
  | 'overdue_digest'
  | 'daily_briefing'
  | 'daily_summary'
  | 'focus_complete';

export interface NotificationSettings {
  enabled: boolean;
  taskRemindersEnabled: boolean;
  taskReminderLeadMinutes: number; // e.g. 5, 10, 15
  overdueRemindersEnabled: boolean;
  dailyBriefingReminderEnabled: boolean;
  dailyBriefingTime: string; // HH:mm
  dailySummaryReminderEnabled: boolean;
  dailySummaryTime: string; // HH:mm
  focusRemindersEnabled: boolean;
  updatedAt: string;
}

export type UpdateNotificationSettingsDTO = Partial<Omit<NotificationSettings, 'updatedAt'>>;

export interface NotificationLogEntry {
  id: string;
  type: NotificationType;
  referenceId: string;
  sentAt: string;
}
