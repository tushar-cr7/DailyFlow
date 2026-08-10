import type { SystemInfoRequest, SystemInfoResponse, IpcResult } from '../shared/types/ipc';
import type { DatabaseStatus } from '../shared/types/database';

export interface DailyFlowAPI {
  platform: string;
  versions: {
    electron: string;
    chrome: string;
    node: string;
  };
  isSecureContext: boolean;
  getSystemInfo: (request?: SystemInfoRequest) => Promise<IpcResult<SystemInfoResponse>>;
  getDatabaseStatus: () => Promise<IpcResult<DatabaseStatus>>;
}

declare global {
  interface Window {
    dailyflow: DailyFlowAPI;
  }
}

export {};
