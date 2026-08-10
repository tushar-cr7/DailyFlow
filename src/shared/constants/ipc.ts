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
} as const;

export type IpcChannel =
  | (typeof IPC_CHANNELS.SYSTEM)[keyof typeof IPC_CHANNELS.SYSTEM]
  | (typeof IPC_CHANNELS.DATABASE)[keyof typeof IPC_CHANNELS.DATABASE]
  | (typeof IPC_CHANNELS.TASK)[keyof typeof IPC_CHANNELS.TASK]
  | (typeof IPC_CHANNELS.ENGAGEMENT)[keyof typeof IPC_CHANNELS.ENGAGEMENT];
