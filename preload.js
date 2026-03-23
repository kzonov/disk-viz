const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('diskViz', {
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  startScan: (dirPath, excludePaths) => ipcRenderer.invoke('scan:start', dirPath, excludePaths),
  cancelScan: () => ipcRenderer.invoke('scan:cancel'),
  onScanMessage: (callback) => {
    const handler = (_event, msg) => callback(msg);
    ipcRenderer.on('scan:message', handler);
    return () => ipcRenderer.removeListener('scan:message', handler);
  },
  trashItem: (filePath) => ipcRenderer.invoke('shell:trashItem', filePath),
  openInFinder: (filePath) => ipcRenderer.invoke('shell:openInFinder', filePath),
});
