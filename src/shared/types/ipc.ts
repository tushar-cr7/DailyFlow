export interface SystemInfoRequest {
  includeEnv?: boolean;
}

export interface SystemInfoResponse {
  appName: string;
  appVersion: string;
  electronVersion: string;
  chromeVersion: string;
  nodeVersion: string;
  platform: string;
  arch: string;
  timestamp: number;
}

export interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
