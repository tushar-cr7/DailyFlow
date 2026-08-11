import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipc';
import type { IpcResult } from '../../shared/types/ipc';
import type { AnalyticsQueryDTO, AnalyticsReport } from '../../shared/types/analytics';
import { getAnalyticsReport } from '../database/analyticsRepository';

export function registerAnalyticsIpcHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.ANALYTICS.GET_DATA,
    async (_event, query?: AnalyticsQueryDTO): Promise<IpcResult<AnalyticsReport>> => {
      try {
        const report = getAnalyticsReport(query);
        return { success: true, data: report };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch analytics report.',
        };
      }
    },
  );
}
