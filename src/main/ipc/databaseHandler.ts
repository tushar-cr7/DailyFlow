import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipc';
import { getDatabaseHealthStatus } from '../database/connection';
import type { DatabaseStatus } from '../../shared/types/database';
import type { IpcResult } from '../../shared/types/ipc';

export function registerDatabaseIpcHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.DATABASE.GET_STATUS,
    async (): Promise<IpcResult<DatabaseStatus>> => {
      try {
        const status = getDatabaseHealthStatus();
        return {
          success: status.initialized,
          data: status,
          error: status.error,
        };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Database IPC handler error',
        };
      }
    },
  );
}
