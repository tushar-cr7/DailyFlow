import { app, BrowserWindow, Menu, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { registerIpcHandlers } from './ipc';
import { initDatabase, closeDatabase } from './database/connection';
import { notificationScheduler } from './services/notificationScheduler';

import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isDev = !app.isPackaged;

function getIconPath(): string {
  const devPath = path.join(__dirname, '../assets/branding/dailyflow-logo.png');
  if (fs.existsSync(devPath)) {
    return devPath;
  }
  const resourcesPath = path.join(process.resourcesPath, 'assets/branding/dailyflow-logo.png');
  if (fs.existsSync(resourcesPath)) {
    return resourcesPath;
  }
  return devPath;
}

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    show: false,
    title: 'DailyFlow — Flow. Focus. Finish.',
    icon: getIconPath(),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  mainWindow.setMenu(null);

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

// Global Error Boundaries for Main Process
process.on('uncaughtException', (error) => {
  console.error('[Main Process Uncaught Exception]:', error.message || error);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Main Process Unhandled Rejection]:', reason);
});

void app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  try {
    initDatabase();
    registerIpcHandlers();
    try {
      notificationScheduler.init();
    } catch (schedErr) {
      console.error('[Scheduler Init Warning]: Notification scheduler failed to initialize:', schedErr);
    }
    createWindow();
  } catch (err) {
    console.error('[Fatal App Startup Error]:', err);
  }

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

