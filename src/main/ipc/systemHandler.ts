import { ipcMain, app } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipc';
import type { SystemInfoResponse, IpcResult } from '../../shared/types/ipc';
import { validateSystemInfoRequest } from '../../shared/utils/validation';

export function registerSystemIpcHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.SYSTEM.GET_INFO,
    async (_event, request: unknown): Promise<IpcResult<SystemInfoResponse>> => {
      const validation = validateSystemInfoRequest(request);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || 'Invalid request payload',
        };
      }

      try {
        const sysInfo: SystemInfoResponse = {
          appName: app.getName(),
          appVersion: app.getVersion(),
          electronVersion: process.versions.electron,
          chromeVersion: process.versions.chrome || 'unknown',
          nodeVersion: process.versions.node,
          platform: process.platform,
          arch: process.arch,
          timestamp: Date.now(),
        };

        return {
          success: true,
          data: sysInfo,
        };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Unknown IPC error',
        };
      }
    },
  );
}
