const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { Worker } = require('worker_threads');

let mainWindow;
let aboutWindow = null;
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

function openAboutWindow() {
  if (aboutWindow && !aboutWindow.isDestroyed()) {
    aboutWindow.focus();
    return;
  }

  aboutWindow = new BrowserWindow({
    width: 380,
    height: 500,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    backgroundColor: '#1a1a2e',
    title: 'About Disk Viz',
    parent: mainWindow,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  aboutWindow.setMenuBarVisibility(false);
  aboutWindow.loadFile('about.html', { search: `v=${app.getVersion()}` });

  aboutWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  aboutWindow.webContents.on('will-navigate', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });
}

function buildMenu() {
  const template = [
    {
      label: app.name,
      submenu: [
        { label: `About ${app.name}`, click: openAboutWindow },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
    {
      role: 'help',
      submenu: [
        {
          label: 'GitHub Repository',
          click: () => shell.openExternal('https://github.com/kzonov/disk-viz'),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  buildMenu();
  createWindow();
});

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
