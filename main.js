const { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let tray = null;

// Generate a crisp Windows 11 Fluent Sticky Note Tray Icon
function createTrayIcon() {
  const icoPath = path.join(__dirname, 'sticky_notes_cute.ico');
  const fs = require('fs');
  if (fs.existsSync(icoPath)) {
    return nativeImage.createFromPath(icoPath);
  }
  const pngPath = path.join(__dirname, 'sticky_notes_cute.png');
  if (fs.existsSync(pngPath)) {
    return nativeImage.createFromPath(pngPath);
  }
  return nativeImage.createEmpty();
}

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    title: 'Sticky Notes',
    width: width,
    height: height,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    skipTaskbar: true, // runs in system tray like a real widget
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Keep floating on top of standard desktop windows
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(true);

  // Load index.html
  mainWindow.loadFile('index.html');

  // By default, make transparent regions click-through
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  // Handle IPC mouse event toggle from renderer
  ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win && !win.isDestroyed()) {
      win.setIgnoreMouseEvents(ignore, options || { forward: true });
    }
  });

  ipcMain.on('app-quit', () => {
    app.quit();
  });

  ipcMain.on('app-minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  // Resolves safe writable storage path across Development, Portable EXE, and Installed Windows package
  function getStoragePath(filename) {
    if (process.env.PORTABLE_EXECUTABLE_DIR) {
      return path.join(process.env.PORTABLE_EXECUTABLE_DIR, filename);
    }
    if (app.isPackaged) {
      const userDir = app.getPath('userData');
      if (!fs.existsSync(userDir)) {
        try {
          fs.mkdirSync(userDir, { recursive: true });
        } catch (e) {}
      }
      return path.join(userDir, filename);
    }
    return path.join(__dirname, filename);
  }

  // Disk persistence IPC handlers with automatic backup protection
  ipcMain.handle('save-notes-to-disk', (event, jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        const filePath = getStoragePath('notes.json');
        fs.writeFileSync(filePath, jsonString, 'utf8');

        // Automatically update persistent backup whenever valid notes are saved
        if (parsed.length > 0) {
          const backupPath = getStoragePath('notes_backup.json');
          fs.writeFileSync(backupPath, jsonString, 'utf8');
        }
        return { success: true };
      }
      return { success: false, error: 'Invalid notes array' };
    } catch (err) {
      console.error('Failed to write notes.json:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('get-notes-from-disk', () => {
    try {
      const filePath = getStoragePath('notes.json');
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8').trim();
        if (content && content !== '[]') {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return content;
          }
        }
      }
      // Automatic recovery from notes_backup.json if primary notes.json is missing or empty
      const backupPath = getStoragePath('notes_backup.json');
      if (fs.existsSync(backupPath)) {
        const backupContent = fs.readFileSync(backupPath, 'utf8').trim();
        if (backupContent) {
          return backupContent;
        }
      }

      // Check bundled / dev fallback
      const devPath = path.join(__dirname, 'notes.json');
      if (fs.existsSync(devPath)) {
        const devContent = fs.readFileSync(devPath, 'utf8').trim();
        if (devContent && devContent !== '[]') return devContent;
      }

      const examplePath = path.join(__dirname, 'notes.example.json');
      if (fs.existsSync(examplePath)) {
        const exampleContent = fs.readFileSync(examplePath, 'utf8').trim();
        if (exampleContent) {
          return exampleContent;
        }
      }
      return null;
    } catch (err) {
      console.error('Failed to read notes.json:', err);
      return null;
    }
  });

  // App session state persistence (remembers exact note open, position, dock state)
  ipcMain.handle('save-state-to-disk', (event, jsonString) => {
    try {
      const filePath = getStoragePath('app_state.json');
      fs.writeFileSync(filePath, jsonString, 'utf8');
      return { success: true };
    } catch (err) {
      console.error('Failed to write app_state.json:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('get-state-from-disk', () => {
    try {
      const filePath = getStoragePath('app_state.json');
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8');
      }
      return null;
    } catch (err) {
      console.error('Failed to read app_state.json:', err);
      return null;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupTray() {
  try {
    const icoPath = path.join(__dirname, 'sticky_notes_cute.ico');
    tray = new Tray(icoPath);
    tray.setToolTip('Sticky Notes');

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Sticky Notes (Fluent Widget)',
        enabled: false
      },
      { type: 'separator' },
      {
        label: '➕ New Note (Ctrl+Alt+N)',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.webContents.send('trigger-new-note');
          }
        }
      },
      {
        label: '👁️ Show / Hide Widget',
        click: () => {
          if (mainWindow) {
            if (mainWindow.isVisible()) {
              mainWindow.hide();
            } else {
              mainWindow.show();
            }
          }
        }
      },
      {
        label: '📂 Collapse / Expand Dock (Ctrl+Alt+H)',
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send('trigger-toggle-collapse');
          }
        }
      },
      {
        label: '⇄ Switch Edge (Left / Right)',
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send('trigger-toggle-dock-side');
          }
        }
      },
      {
        label: '🔇 Toggle Mute / Sound',
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send('trigger-toggle-sound');
          }
        }
      },
      { type: 'separator' },
      {
        label: '❌ Exit Widget',
        click: () => {
          app.quit();
        }
      }
    ]);

    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.webContents.send('trigger-new-note');
        } else {
          mainWindow.show();
        }
      }
    });
  } catch (err) {
    console.warn('Tray setup note:', err.message);
  }
}

app.whenReady().then(() => {
  createWindow();
  setupTray();

  // Register global hotkeys
  globalShortcut.register('CommandOrControl+Alt+N', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.webContents.send('trigger-new-note');
    }
  });

  globalShortcut.register('CommandOrControl+Alt+H', () => {
    if (mainWindow) {
      mainWindow.webContents.send('trigger-toggle-collapse');
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('app-before-quit');
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
