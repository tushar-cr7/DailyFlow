import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipc';
import {
  getEngagementStats,
  getAchievementProgressList,
  recalculateEngagementState,
} from '../database/engagementRepository';
import type { EngagementStats, AchievementProgress } from '../../shared/types/engagement';
import type { IpcResult } from '../../shared/types/ipc';

export function registerEngagementIpcHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.ENGAGEMENT.GET_STATS,
    async (_event, dateStr?: unknown): Promise<IpcResult<EngagementStats>> => {
      try {
        const date = typeof dateStr === 'string' ? dateStr : undefined;
        const stats = getEngagementStats(date);
        return { success: true, data: stats };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to fetch engagement stats',
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.ENGAGEMENT.GET_ACHIEVEMENTS,
    async (): Promise<IpcResult<AchievementProgress[]>> => {
      try {
        const achievements = getAchievementProgressList();
        return { success: true, data: achievements };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to fetch achievements',
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.ENGAGEMENT.RECALCULATE,
    async (_event, dateStr?: unknown): Promise<IpcResult<EngagementStats>> => {
      try {
        const date = typeof dateStr === 'string' ? dateStr : undefined;
        const stats = recalculateEngagementState(date);
        return { success: true, data: stats };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to recalculate engagement stats',
        };
      }
    },
  );
}
