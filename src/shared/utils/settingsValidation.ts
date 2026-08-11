import type {
  UserSettings,
  UpdateUserSettingsDTO,
  DailyFlowBackupData,
} from '../types/settings';

export const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'storage' | 'updatedAt'> = {
  general: {
    userName: 'Flow User',
    startOfWeek: 'monday',
    timeFormat: '12h',
    launchAtLogin: false,
  },
  productivity: {
    defaultView: 'today',
    defaultFocusMinutes: 25,
    autoOpenDailyBriefing: true,
    presetFocusDurations: [15, 25, 45, 60],
  },
  appearance: {
    theme: 'dark',
    density: 'comfortable',
    reducedMotion: false,
    accentColor: 'indigo',
    environment: 'emerald-forest',
  },
  notifications: {
    enabled: true,
    taskRemindersEnabled: true,
    taskReminderLeadMinutes: 5,
    overdueRemindersEnabled: true,
    dailyBriefingReminderEnabled: true,
    dailyBriefingTime: '09:00',
    dailySummaryReminderEnabled: true,
    dailySummaryTime: '18:00',
    focusRemindersEnabled: true,
    updatedAt: '',
  },
  engagement: {
    showCelebrations: true,
    showStreakBanners: true,
    showXPNotifications: true,
    autoCompleteTaskOnFocusEnd: false,
  },
};

const VALID_START_OF_WEEK = new Set(['monday', 'sunday']);
const VALID_TIME_FORMAT = new Set(['12h', '24h']);
const VALID_DEFAULT_VIEW = new Set(['today', 'upcoming']);
const VALID_THEME = new Set(['dark', 'light', 'system']);
const VALID_DENSITY = new Set(['comfortable', 'compact']);
const VALID_ACCENT_COLOR = new Set(['indigo', 'emerald', 'violet', 'amber', 'cyan']);
const VALID_ENVIRONMENT = new Set(['emerald-forest', 'deep-ocean', 'mountain-lake', 'night-sky', 'sunset-horizon']);
const VALID_TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function validateUpdateUserSettingsDTO(dto: unknown): {
  valid: boolean;
  errors: string[];
  sanitized: UpdateUserSettingsDTO;
} {
  const errors: string[] = [];
  if (!dto || typeof dto !== 'object') {
    return { valid: false, errors: ['Settings update payload must be an object'], sanitized: {} };
  }

  const raw = dto as UpdateUserSettingsDTO;
  const sanitized: UpdateUserSettingsDTO = {};

  if (raw.general !== undefined) {
    if (typeof raw.general !== 'object' || raw.general === null) {
      errors.push('general settings must be an object');
    } else {
      sanitized.general = {};
      if (raw.general.userName !== undefined) {
        if (typeof raw.general.userName !== 'string' || raw.general.userName.trim().length === 0) {
          errors.push('userName must be a non-empty string');
        } else if (raw.general.userName.length > 50) {
          errors.push('userName cannot exceed 50 characters');
        } else {
          sanitized.general.userName = raw.general.userName.trim();
        }
      }
      if (raw.general.startOfWeek !== undefined) {
        if (!VALID_START_OF_WEEK.has(raw.general.startOfWeek)) {
          errors.push('startOfWeek must be "monday" or "sunday"');
        } else {
          sanitized.general.startOfWeek = raw.general.startOfWeek;
        }
      }
      if (raw.general.timeFormat !== undefined) {
        if (!VALID_TIME_FORMAT.has(raw.general.timeFormat)) {
          errors.push('timeFormat must be "12h" or "24h"');
        } else {
          sanitized.general.timeFormat = raw.general.timeFormat;
        }
      }
      if (raw.general.launchAtLogin !== undefined) {
        if (typeof raw.general.launchAtLogin !== 'boolean') {
          errors.push('launchAtLogin must be a boolean');
        } else {
          sanitized.general.launchAtLogin = raw.general.launchAtLogin;
        }
      }
    }
  }

  if (raw.productivity !== undefined) {
    if (typeof raw.productivity !== 'object' || raw.productivity === null) {
      errors.push('productivity settings must be an object');
    } else {
      sanitized.productivity = {};
      if (raw.productivity.defaultView !== undefined) {
        if (!VALID_DEFAULT_VIEW.has(raw.productivity.defaultView)) {
          errors.push('defaultView must be "today" or "upcoming"');
        } else {
          sanitized.productivity.defaultView = raw.productivity.defaultView;
        }
      }
      if (raw.productivity.defaultFocusMinutes !== undefined) {
        const val = raw.productivity.defaultFocusMinutes;
        if (typeof val !== 'number' || val < 1 || val > 360 || !Number.isInteger(val)) {
          errors.push('defaultFocusMinutes must be an integer between 1 and 360');
        } else {
          sanitized.productivity.defaultFocusMinutes = val;
        }
      }
      if (raw.productivity.autoOpenDailyBriefing !== undefined) {
        if (typeof raw.productivity.autoOpenDailyBriefing !== 'boolean') {
          errors.push('autoOpenDailyBriefing must be a boolean');
        } else {
          sanitized.productivity.autoOpenDailyBriefing = raw.productivity.autoOpenDailyBriefing;
        }
      }
      if (raw.productivity.presetFocusDurations !== undefined) {
        const arr = raw.productivity.presetFocusDurations;
        if (
          !Array.isArray(arr) ||
          arr.length === 0 ||
          !arr.every((n) => typeof n === 'number' && Number.isInteger(n) && n > 0 && n <= 360)
        ) {
          errors.push('presetFocusDurations must be an array of positive integers (1..360)');
        } else {
          sanitized.productivity.presetFocusDurations = Array.from(new Set(arr)).sort(
            (a, b) => a - b,
          );
        }
      }
    }
  }

  if (raw.appearance !== undefined) {
    if (typeof raw.appearance !== 'object' || raw.appearance === null) {
      errors.push('appearance settings must be an object');
    } else {
      sanitized.appearance = {};
      if (raw.appearance.theme !== undefined) {
        if (!VALID_THEME.has(raw.appearance.theme)) {
          errors.push('theme must be "dark", "light", or "system"');
        } else {
          sanitized.appearance.theme = raw.appearance.theme;
        }
      }
      if (raw.appearance.density !== undefined) {
        if (!VALID_DENSITY.has(raw.appearance.density)) {
          errors.push('density must be "comfortable" or "compact"');
        } else {
          sanitized.appearance.density = raw.appearance.density;
        }
      }
      if (raw.appearance.reducedMotion !== undefined) {
        if (typeof raw.appearance.reducedMotion !== 'boolean') {
          errors.push('reducedMotion must be a boolean');
        } else {
          sanitized.appearance.reducedMotion = raw.appearance.reducedMotion;
        }
      }
      if (raw.appearance.accentColor !== undefined) {
        if (!VALID_ACCENT_COLOR.has(raw.appearance.accentColor)) {
          errors.push('accentColor must be "indigo", "emerald", "violet", "amber", or "cyan"');
        } else {
          sanitized.appearance.accentColor = raw.appearance.accentColor;
        }
      }
      if (raw.appearance.environment !== undefined) {
        if (!VALID_ENVIRONMENT.has(raw.appearance.environment)) {
          errors.push('environment must be a valid environment theme');
        } else {
          sanitized.appearance.environment = raw.appearance.environment;
        }
      }
    }
  }

  if (raw.notifications !== undefined) {
    if (typeof raw.notifications !== 'object' || raw.notifications === null) {
      errors.push('notification settings must be an object');
    } else {
      sanitized.notifications = {};
      const n = raw.notifications;
      if (n.enabled !== undefined) {
        if (typeof n.enabled !== 'boolean') errors.push('notifications.enabled must be boolean');
        else sanitized.notifications.enabled = n.enabled;
      }
      if (n.taskRemindersEnabled !== undefined) {
        if (typeof n.taskRemindersEnabled !== 'boolean')
          errors.push('notifications.taskRemindersEnabled must be boolean');
        else sanitized.notifications.taskRemindersEnabled = n.taskRemindersEnabled;
      }
      if (n.taskReminderLeadMinutes !== undefined) {
        if (
          typeof n.taskReminderLeadMinutes !== 'number' ||
          n.taskReminderLeadMinutes < 1 ||
          n.taskReminderLeadMinutes > 120
        ) {
          errors.push('notifications.taskReminderLeadMinutes must be between 1 and 120');
        } else {
          sanitized.notifications.taskReminderLeadMinutes = n.taskReminderLeadMinutes;
        }
      }
      if (n.overdueRemindersEnabled !== undefined) {
        if (typeof n.overdueRemindersEnabled !== 'boolean')
          errors.push('notifications.overdueRemindersEnabled must be boolean');
        else sanitized.notifications.overdueRemindersEnabled = n.overdueRemindersEnabled;
      }
      if (n.dailyBriefingReminderEnabled !== undefined) {
        if (typeof n.dailyBriefingReminderEnabled !== 'boolean')
          errors.push('notifications.dailyBriefingReminderEnabled must be boolean');
        else sanitized.notifications.dailyBriefingReminderEnabled = n.dailyBriefingReminderEnabled;
      }
      if (n.dailyBriefingTime !== undefined) {
        if (
          typeof n.dailyBriefingTime !== 'string' ||
          !VALID_TIME_REGEX.test(n.dailyBriefingTime)
        ) {
          errors.push('notifications.dailyBriefingTime must be in HH:mm format');
        } else {
          sanitized.notifications.dailyBriefingTime = n.dailyBriefingTime;
        }
      }
      if (n.dailySummaryReminderEnabled !== undefined) {
        if (typeof n.dailySummaryReminderEnabled !== 'boolean')
          errors.push('notifications.dailySummaryReminderEnabled must be boolean');
        else sanitized.notifications.dailySummaryReminderEnabled = n.dailySummaryReminderEnabled;
      }
      if (n.dailySummaryTime !== undefined) {
        if (
          typeof n.dailySummaryTime !== 'string' ||
          !VALID_TIME_REGEX.test(n.dailySummaryTime)
        ) {
          errors.push('notifications.dailySummaryTime must be in HH:mm format');
        } else {
          sanitized.notifications.dailySummaryTime = n.dailySummaryTime;
        }
      }
      if (n.focusRemindersEnabled !== undefined) {
        if (typeof n.focusRemindersEnabled !== 'boolean')
          errors.push('notifications.focusRemindersEnabled must be boolean');
        else sanitized.notifications.focusRemindersEnabled = n.focusRemindersEnabled;
      }
    }
  }

  if (raw.engagement !== undefined) {
    if (typeof raw.engagement !== 'object' || raw.engagement === null) {
      errors.push('engagement settings must be an object');
    } else {
      sanitized.engagement = {};
      const e = raw.engagement;
      if (e.showCelebrations !== undefined) {
        if (typeof e.showCelebrations !== 'boolean') errors.push('showCelebrations must be boolean');
        else sanitized.engagement.showCelebrations = e.showCelebrations;
      }
      if (e.showStreakBanners !== undefined) {
        if (typeof e.showStreakBanners !== 'boolean') errors.push('showStreakBanners must be boolean');
        else sanitized.engagement.showStreakBanners = e.showStreakBanners;
      }
      if (e.showXPNotifications !== undefined) {
        if (typeof e.showXPNotifications !== 'boolean')
          errors.push('showXPNotifications must be boolean');
        else sanitized.engagement.showXPNotifications = e.showXPNotifications;
      }
      if (e.autoCompleteTaskOnFocusEnd !== undefined) {
        if (typeof e.autoCompleteTaskOnFocusEnd !== 'boolean')
          errors.push('autoCompleteTaskOnFocusEnd must be boolean');
        else sanitized.engagement.autoCompleteTaskOnFocusEnd = e.autoCompleteTaskOnFocusEnd;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  };
}

export function validateBackupData(data: unknown): {
  valid: boolean;
  errors: string[];
  backup?: DailyFlowBackupData;
} {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Backup data must be a valid JSON object'] };
  }

  const obj = data as Partial<DailyFlowBackupData>;

  if (typeof obj.version !== 'number' || obj.version < 1) {
    errors.push('Backup version missing or invalid');
  }

  if (!obj.userSettings || typeof obj.userSettings !== 'object') {
    errors.push('userSettings missing or invalid in backup payload');
  }

  if (!obj.notificationSettings || typeof obj.notificationSettings !== 'object') {
    errors.push('notificationSettings missing or invalid in backup payload');
  }

  if (!Array.isArray(obj.tasks)) {
    errors.push('tasks section must be an array');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    backup: data as DailyFlowBackupData,
  };
}
