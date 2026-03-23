const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { Worker } = require('worker_threads');

let mainWindow;
let scanWorker = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#1a1a2e',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.handle('dialog:openDirectory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle('scan:start', async (event, dirPath, excludePaths) => {
  if (scanWorker) {
    scanWorker.terminate();
    scanWorker = null;
  }

  scanWorker = new Worker(path.join(__dirname, 'scanner-worker.js'), {
    workerData: { dirPath, excludePaths: excludePaths || [] },
  });

  scanWorker.on('message', (msg) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('scan:message', msg);
    }
  });

  scanWorker.on('error', (err) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('scan:message', {
        type: 'error',
        error: err.message,
      });
    }
    scanWorker = null;
  });

  scanWorker.on('exit', () => {
    scanWorker = null;
  });
});

ipcMain.handle('scan:cancel', async () => {
  if (scanWorker) {
    scanWorker.terminate();
    scanWorker = null;
  }
});

ipcMain.handle('shell:trashItem', async (_event, filePath) => {
  await shell.trashItem(filePath);
});

ipcMain.handle('shell:openInFinder', async (_event, filePath) => {
  shell.showItemInFolder(filePath);
});
