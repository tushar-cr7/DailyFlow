import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/ipc';
import type { IpcResult } from '../../shared/types/ipc';
import type {
  DailyBriefing,
  DailySummary,
  FocusSession,
  LogFocusSessionDTO,
} from '../../shared/types/dailyExperience';
import {
  getDailyBriefing,
  setPrimaryFocus,
  logFocusSession,
  saveDailyReflection,
  getDailySummary,
} from '../database/dailyExperienceRepository';

export function registerDailyExperienceHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.DAILY_EXPERIENCE.GET_BRIEFING,
    async (_event, date?: string): Promise<IpcResult<DailyBriefing>> => {
      try {
        const briefing = getDailyBriefing(date);
        return { success: true, data: briefing };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch daily briefing.',
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.DAILY_EXPERIENCE.SET_PRIMARY_FOCUS,
    async (_event, payload: { taskId: string | null; date?: string }): Promise<IpcResult<DailyBriefing>> => {
      try {
        setPrimaryFocus(payload.taskId, payload.date);
        const briefing = getDailyBriefing(payload.date);
        return { success: true, data: briefing };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to set primary focus task.',
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.DAILY_EXPERIENCE.LOG_FOCUS_SESSION,
    async (_event, dto: LogFocusSessionDTO): Promise<IpcResult<FocusSession>> => {
      try {
        if (!dto || typeof dto.durationSeconds !== 'number' || dto.durationSeconds <= 0) {
          return { success: false, error: 'Duration in seconds must be a positive number.' };
        }
        const session = logFocusSession(dto);
        return { success: true, data: session };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to log focus session.',
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.DAILY_EXPERIENCE.SAVE_REFLECTION,
    async (_event, payload: { reflection: string; date?: string }): Promise<IpcResult<DailySummary>> => {
      try {
        saveDailyReflection(payload.reflection || '', payload.date);
        const summary = getDailySummary(payload.date);
        return { success: true, data: summary };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to save daily reflection.',
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.DAILY_EXPERIENCE.GET_SUMMARY,
    async (_event, date?: string): Promise<IpcResult<DailySummary>> => {
      try {
        const summary = getDailySummary(date);
        return { success: true, data: summary };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch daily summary.',
        };
      }
    },
  );
}
