import { app, BrowserWindow, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { registerIpcHandlers } from './ipc';
import { initDatabase, closeDatabase } from './database/connection';
import { notificationScheduler } from './services/notificationScheduler';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isDev = !app.isPackaged;

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    show: false,
    title: 'DailyFlow',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Prevent navigation to external URLs in the main window.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      void shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const devServerUrl = process.env.VITE_DEV_SERVER_URL;
    if (devServerUrl && url.startsWith(devServerUrl)) {
      return;
    }
    if (url.startsWith('file://')) {
      return;
    }
    event.preventDefault();
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    void mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  return mainWindow;
}

void app.whenReady().then(() => {
  initDatabase();
  registerIpcHandlers();
  notificationScheduler.init();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  notificationScheduler.destroy();
  closeDatabase();
});

