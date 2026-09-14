const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  setIgnoreMouseEvents: (ignore, options) => {
    ipcRenderer.send('set-ignore-mouse-events', ignore, options);
  },
  quitApp: () => {
    ipcRenderer.send('app-quit');
  },
  minimizeApp: () => {
    ipcRenderer.send('app-minimize');
  },
  onNewNoteTrigger: (callback) => {
    ipcRenderer.on('trigger-new-note', () => callback());
  },
  onResetDataTrigger: (callback) => {
    ipcRenderer.on('trigger-reset-data', () => callback());
  },
  onToggleSoundTrigger: (callback) => {
    ipcRenderer.on('trigger-toggle-sound', () => callback());
  },
  saveNotesToDisk: (jsonString) => {
    return ipcRenderer.invoke('save-notes-to-disk', jsonString);
  },
  getNotesFromDisk: () => {
    return ipcRenderer.invoke('get-notes-from-disk');
  },
  saveStateToDisk: (jsonString) => {
    return ipcRenderer.invoke('save-state-to-disk', jsonString);
  },
  getStateFromDisk: () => {
    return ipcRenderer.invoke('get-state-from-disk');
  },
  onBeforeQuit: (callback) => {
    ipcRenderer.on('app-before-quit', () => callback());
  }
});
