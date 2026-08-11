import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants/ipc';
import type { SystemInfoRequest, SystemInfoResponse, IpcResult } from '../shared/types/ipc';
import type { DatabaseStatus } from '../shared/types/database';
import type { Task, CreateTaskDTO, UpdateTaskDTO, TaskFilter } from '../shared/types/task';
import type { EngagementStats, AchievementProgress } from '../shared/types/engagement';

/**
 * Preload API for Core Task Management and Engagement Engine.
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
  // Task Management API
  getTasks: async (filter?: TaskFilter): Promise<IpcResult<Task[]>> => {
    return ipcRenderer.invoke(IPC_CHANNELS.TASK.GET_ALL, filter);
  },
  createTask: async (dto: CreateTaskDTO): Promise<IpcResult<Task>> => {
    return ipcRenderer.invoke(IPC_CHANNELS.TASK.CREATE, dto);
  },
  updateTask: async (dto: UpdateTaskDTO): Promise<IpcResult<Task>> => {
    return ipcRenderer.invoke(IPC_CHANNELS.TASK.UPDATE, dto);
  },
  deleteTask: async (id: string): Promise<IpcResult<{ id: string }>> => {
    return ipcRenderer.invoke(IPC_CHANNELS.TASK.DELETE, { id });
  },
  // Phase 7 Engagement Engine API
  getEngagementStats: async (date?: string): Promise<IpcResult<EngagementStats>> => {
    return ipcRenderer.invoke(IPC_CHANNELS.ENGAGEMENT.GET_STATS, date);
  },
  getAchievements: async (): Promise<IpcResult<AchievementProgress[]>> => {
    return ipcRenderer.invoke(IPC_CHANNELS.ENGAGEMENT.GET_ACHIEVEMENTS);
  },
  recalculateEngagement: async (date?: string): Promise<IpcResult<EngagementStats>> => {
    return ipcRenderer.invoke(IPC_CHANNELS.ENGAGEMENT.RECALCULATE, date);
  },
  // Phase 8 Daily Experience API
  getDailyBriefing: async (date?: string): Promise<IpcResult<DailyBriefing>> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DAILY_EXPERIENCE.GET_BRIEFING, date);
  },
  setPrimaryFocus: async (
    taskId: string | null,
    date?: string,
  ): Promise<IpcResult<DailyBriefing>> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DAILY_EXPERIENCE.SET_PRIMARY_FOCUS, { taskId, date });
  },
  logFocusSession: async (dto: LogFocusSessionDTO): Promise<IpcResult<FocusSession>> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DAILY_EXPERIENCE.LOG_FOCUS_SESSION, dto);
  },
  saveDailyReflection: async (
    reflection: string,
    date?: string,
  ): Promise<IpcResult<DailySummary>> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DAILY_EXPERIENCE.SAVE_REFLECTION, { reflection, date });
  },
  getDailySummary: async (date?: string): Promise<IpcResult<DailySummary>> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DAILY_EXPERIENCE.GET_SUMMARY, date);
  },
});

