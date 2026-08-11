export const IPC_CHANNELS = {
  SYSTEM: {
    GET_INFO: 'system:get-info',
  },
  DATABASE: {
    GET_STATUS: 'database:get-status',
  },
  TASK: {
    GET_ALL: 'task:get-all',
    CREATE: 'task:create',
    UPDATE: 'task:update',
    DELETE: 'task:delete',
  },
  ENGAGEMENT: {
    GET_STATS: 'engagement:get-stats',
    GET_ACHIEVEMENTS: 'engagement:get-achievements',
    RECALCULATE: 'engagement:recalculate',
  },
  DAILY_EXPERIENCE: {
    GET_BRIEFING: 'daily:get-briefing',
    SET_PRIMARY_FOCUS: 'daily:set-primary-focus',
    LOG_FOCUS_SESSION: 'daily:log-focus-session',
    SAVE_REFLECTION: 'daily:save-reflection',
    GET_SUMMARY: 'daily:get-summary',
  },
  ANALYTICS: {
    GET_DATA: 'analytics:get-data',
  },
  NOTIFICATION: {
    GET_SETTINGS: 'notification:get-settings',
    UPDATE_SETTINGS: 'notification:update-settings',
    TEST_NOTIFICATION: 'notification:test-notification',
  },
  SETTINGS: {
    GET: 'settings:get',
    UPDATE: 'settings:update',
    EXPORT: 'settings:export-data',
    IMPORT: 'settings:import-data',
    RESET: 'settings:reset-data',
  },
} as const;

export type IpcChannel =
  | (typeof IPC_CHANNELS.SYSTEM)[keyof typeof IPC_CHANNELS.SYSTEM]
  | (typeof IPC_CHANNELS.DATABASE)[keyof typeof IPC_CHANNELS.DATABASE]
  | (typeof IPC_CHANNELS.TASK)[keyof typeof IPC_CHANNELS.TASK]
  | (typeof IPC_CHANNELS.ENGAGEMENT)[keyof typeof IPC_CHANNELS.ENGAGEMENT]
  | (typeof IPC_CHANNELS.DAILY_EXPERIENCE)[keyof typeof IPC_CHANNELS.DAILY_EXPERIENCE]
  | (typeof IPC_CHANNELS.ANALYTICS)[keyof typeof IPC_CHANNELS.ANALYTICS]
  | (typeof IPC_CHANNELS.NOTIFICATION)[keyof typeof IPC_CHANNELS.NOTIFICATION]
  | (typeof IPC_CHANNELS.SETTINGS)[keyof typeof IPC_CHANNELS.SETTINGS];



