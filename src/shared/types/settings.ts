import type { NotificationSettings, UpdateNotificationSettingsDTO } from './notifications';

export interface GeneralSettings {
  userName: string;
  startOfWeek: 'monday' | 'sunday';
  timeFormat: '12h' | '24h';
  launchAtLogin: boolean;
}

export interface ProductivitySettings {
  defaultView: 'today' | 'upcoming';
  defaultFocusMinutes: number;
  autoOpenDailyBriefing: boolean;
  presetFocusDurations: number[];
}

export interface AppearanceSettings {
  theme: 'dark' | 'light' | 'system';
  density: 'comfortable' | 'compact';
  reducedMotion: boolean;
  accentColor: 'indigo' | 'emerald' | 'violet' | 'amber' | 'cyan';
  environment?: 'emerald-forest' | 'deep-ocean' | 'mountain-lake' | 'night-sky' | 'sunset-horizon';
}

export interface EngagementSettings {
  showCelebrations: boolean;
  showStreakBanners: boolean;
  showXPNotifications: boolean;
  autoCompleteTaskOnFocusEnd: boolean;
}

export interface StorageInfo {
  dbPath: string;
  userDataPath: string;
  dbSizeBytes: number;
}

export interface UserSettings {
  general: GeneralSettings;
  productivity: ProductivitySettings;
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  engagement: EngagementSettings;
  storage: StorageInfo;
  updatedAt: string;
}

export interface UpdateUserSettingsDTO {
  general?: Partial<GeneralSettings>;
  productivity?: Partial<ProductivitySettings>;
  appearance?: Partial<AppearanceSettings>;
  notifications?: UpdateNotificationSettingsDTO;
  engagement?: Partial<EngagementSettings>;
}

export interface DailyFlowBackupData {
  version: number;
  exportedAt: string;
  userSettings: {
    general: GeneralSettings;
    productivity: ProductivitySettings;
    appearance: AppearanceSettings;
    engagement: EngagementSettings;
  };
  notificationSettings: NotificationSettings;
  tasks: unknown[];
  userEngagement: unknown;
  achievements: unknown[];
  dailyLogs: unknown[];
  focusSessions: unknown[];
}
