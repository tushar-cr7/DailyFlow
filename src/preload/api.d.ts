export interface DailyFlowAPI {
  platform: string;
  versions: {
    electron: string;
    chrome: string;
    node: string;
  };
  isSecureContext: boolean;
}

declare global {
  interface Window {
    dailyflow: DailyFlowAPI;
  }
}

export {};
