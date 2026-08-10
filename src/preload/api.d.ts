import type { SystemInfoRequest, SystemInfoResponse, IpcResult } from '../shared/types/ipc';

export interface DailyFlowAPI {
  platform: string;
  versions: {
    electron: string;
    chrome: string;
    node: string;
  };
  isSecureContext: boolean;
  getSystemInfo: (request?: SystemInfoRequest) => Promise<IpcResult<SystemInfoResponse>>;
}

declare global {
  interface Window {
    dailyflow: DailyFlowAPI;
  }
}

export {};
