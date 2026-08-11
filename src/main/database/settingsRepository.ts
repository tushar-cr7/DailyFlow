import fs from 'node:fs';
import type Database from 'better-sqlite3';
import { getDatabase } from './connection';
import {
  getNotificationSettings,
  updateNotificationSettings,
} from './notificationRepository';
import type { UserSettings, UpdateUserSettingsDTO, StorageInfo } from '../../shared/types/settings';
import {
  DEFAULT_USER_SETTINGS,
  validateUpdateUserSettingsDTO,
} from '../../shared/utils/settingsValidation';
import { notificationScheduler } from '../services/notificationScheduler';

interface UserSettingsRow {
  id: number;
  user_name: string;
  start_of_week: 'monday' | 'sunday';
  time_format: '12h' | '24h';
  launch_at_login: number;
  default_view: 'today' | 'upcoming';
  default_focus_minutes: number;
  auto_open_daily_briefing: number;
  preset_focus_durations: string;
  theme: 'dark' | 'light' | 'system';
  density: 'comfortable' | 'compact';
  reduced_motion: number;
  accent_color: 'indigo' | 'emerald' | 'violet' | 'amber' | 'cyan';
  environment?: 'emerald-forest' | 'deep-ocean' | 'mountain-lake' | 'night-sky' | 'sunset-horizon';
  show_celebrations: number;
  show_streak_banners: number;
  show_xp_notifications: number;
  auto_complete_task_on_focus_end: number;
  updated_at: string;
}

export function getStorageInfo(db: Database.Database): StorageInfo {
  const dbPath = db.name || '';
  let dbSizeBytes = 0;
  try {
    if (dbPath && dbPath !== ':memory:' && fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      dbSizeBytes = stats.size;
    }
  } catch {
    // Ignore stat error for in-memory or unreadable path
  }

  return {
    dbPath,
    userDataPath: dbPath ? dbPath.replace(/[/\\][^/\\]+$/, '') : '',
    dbSizeBytes,
  };
}

export function getUserSettings(customDb?: Database.Database): UserSettings {
  const db = customDb || getDatabase();

  const notifSettings = getNotificationSettings(db);
  const row = db
    .prepare('SELECT * FROM user_settings WHERE id = 1')
    .get() as UserSettingsRow | undefined;

  const storage = getStorageInfo(db);

  if (!row) {
    return {
      ...DEFAULT_USER_SETTINGS,
      notifications: notifSettings,
      storage,
      updatedAt: new Date().toISOString(),
    };
  }

  let presetFocusDurations = DEFAULT_USER_SETTINGS.productivity.presetFocusDurations;
  try {
    const parsed = JSON.parse(row.preset_focus_durations);
    if (Array.isArray(parsed) && parsed.length > 0) {
      presetFocusDurations = parsed;
    }
  } catch {
    // Fallback to default
  }

  return {
    general: {
      userName: row.user_name || DEFAULT_USER_SETTINGS.general.userName,
      startOfWeek: row.start_of_week || DEFAULT_USER_SETTINGS.general.startOfWeek,
      timeFormat: row.time_format || DEFAULT_USER_SETTINGS.general.timeFormat,
      launchAtLogin: row.launch_at_login === 1,
    },
    productivity: {
      defaultView: row.default_view || DEFAULT_USER_SETTINGS.productivity.defaultView,
      defaultFocusMinutes: row.default_focus_minutes || DEFAULT_USER_SETTINGS.productivity.defaultFocusMinutes,
      autoOpenDailyBriefing: row.auto_open_daily_briefing === 1,
      presetFocusDurations,
    },
    appearance: {
      theme: row.theme || DEFAULT_USER_SETTINGS.appearance.theme,
      density: row.density || DEFAULT_USER_SETTINGS.appearance.density,
      reducedMotion: row.reduced_motion === 1,
      accentColor: row.accent_color || DEFAULT_USER_SETTINGS.appearance.accentColor,
      environment: row.environment || DEFAULT_USER_SETTINGS.appearance.environment,
    },
    notifications: notifSettings,
    engagement: {
      showCelebrations: row.show_celebrations === 1,
      showStreakBanners: row.show_streak_banners === 1,
      showXPNotifications: row.show_xp_notifications === 1,
      autoCompleteTaskOnFocusEnd: row.auto_complete_task_on_focus_end === 1,
    },
    storage,
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export function updateUserSettings(
  rawDto: UpdateUserSettingsDTO,
  customDb?: Database.Database,
): UserSettings {
  const db = customDb || getDatabase();

  // Enforce Main process validation before database write
  const { valid, errors, sanitized } = validateUpdateUserSettingsDTO(rawDto);
  if (!valid) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }

  const current = getUserSettings(db);

  let notificationsUpdated = false;
  if (sanitized.notifications && Object.keys(sanitized.notifications).length > 0) {
    updateNotificationSettings(sanitized.notifications, db);
    notificationsUpdated = true;
  }

  const mergedGeneral = { ...current.general, ...sanitized.general };
  const mergedProductivity = { ...current.productivity, ...sanitized.productivity };
  const mergedAppearance = { ...current.appearance, ...sanitized.appearance };
  const mergedEngagement = { ...current.engagement, ...sanitized.engagement };

  db.prepare(`
    UPDATE user_settings
    SET user_name = ?,
        start_of_week = ?,
        time_format = ?,
        launch_at_login = ?,
        default_view = ?,
        default_focus_minutes = ?,
        auto_open_daily_briefing = ?,
        preset_focus_durations = ?,
        theme = ?,
        density = ?,
        reduced_motion = ?,
        accent_color = ?,
        environment = ?,
        show_celebrations = ?,
        show_streak_banners = ?,
        show_xp_notifications = ?,
        auto_complete_task_on_focus_end = ?,
        updated_at = datetime('now')
    WHERE id = 1
  `).run(
    mergedGeneral.userName,
    mergedGeneral.startOfWeek,
    mergedGeneral.timeFormat,
    mergedGeneral.launchAtLogin ? 1 : 0,
    mergedProductivity.defaultView,
    mergedProductivity.defaultFocusMinutes,
    mergedProductivity.autoOpenDailyBriefing ? 1 : 0,
    JSON.stringify(mergedProductivity.presetFocusDurations),
    mergedAppearance.theme,
    mergedAppearance.density,
    mergedAppearance.reducedMotion ? 1 : 0,
    mergedAppearance.accentColor,
    mergedAppearance.environment || 'emerald-forest',
    mergedEngagement.showCelebrations ? 1 : 0,
    mergedEngagement.showStreakBanners ? 1 : 0,
    mergedEngagement.showXPNotifications ? 1 : 0,
    mergedEngagement.autoCompleteTaskOnFocusEnd ? 1 : 0,
  );

  // Synchronize notification scheduler if notification settings changed
  if (notificationsUpdated) {
    notificationScheduler.rescheduleAll();
  }

  return getUserSettings(db);
}
