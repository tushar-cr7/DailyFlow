import { contextBridge } from 'electron';

/**
 * Minimal preload API for Phase 1.
 * Full IPC channels will be added in Phase 2.
 */
contextBridge.exposeInMainWorld('dailyflow', {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
  isSecureContext: true,
});
