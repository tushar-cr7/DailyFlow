export const IPC_CHANNELS = {
  SYSTEM: {
    GET_INFO: 'system:get-info',
  },
} as const;

export type IpcChannel =
  (typeof IPC_CHANNELS.SYSTEM)[keyof typeof IPC_CHANNELS.SYSTEM];
