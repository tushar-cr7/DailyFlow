import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants/ipc';
import type { SystemInfoRequest, SystemInfoResponse, IpcResult } from '../shared/types/ipc';
import type { DatabaseStatus } from '../shared/types/database';

/**
 * Preload API for Phase 3 SQLite Persistence Architecture.
 * Exposes specific, type-safe IPC methods via contextBridge.
 * ipcRenderer is NEVER exposed directly to the renderer.
 */
contextBridge.exposeInMainWorld('dailyflow', {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
  isSecureContext: true,
  getSystemInfo: async (
    request?: SystemInfoRequest,
  ): Promise<IpcResult<SystemInfoResponse>> => {
    return ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.GET_INFO, request);
  },
  getDatabaseStatus: async (): Promise<IpcResult<DatabaseStatus>> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DATABASE.GET_STATUS);
  },
});
