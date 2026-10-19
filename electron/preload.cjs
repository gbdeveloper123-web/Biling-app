const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  printReceipt: (htmlContent) => ipcRenderer.invoke('print-receipt', htmlContent),
  sqliteQuery: (sql, params) => ipcRenderer.invoke('sqlite-query', sql, params),
  sqliteExecute: (sql, params) => ipcRenderer.invoke('sqlite-execute', sql, params),
  getDeviceHardwareId: () => ipcRenderer.invoke('get-hardware-id'),
  onNetworkChange: (callback) => {
    ipcRenderer.on('network-status-changed', (_event, isOnline) => callback(isOnline));
  },
});
