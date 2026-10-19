const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function getDatabasePath() {
  const userDataPath = app.getPath('userData');
  const dbDir = path.join(userDataPath, 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  return path.join(dbDir, 'vyaprix_offline.json');
}

function readLocalDatabase() {
  const dbFile = getDatabasePath();
  if (!fs.existsSync(dbFile)) {
    const initialData = {
      invoices: [],
      products: [],
      customers: [],
      purchases: [],
      syncQueue: [],
      lastSyncedAt: null,
    };
    fs.writeFileSync(dbFile, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  } catch (err) {
    console.error('Error reading offline database file:', err);
    return { invoices: [], products: [], customers: [], purchases: [], syncQueue: [] };
  }
}

function writeLocalDatabase(data) {
  const dbFile = getDatabasePath();
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: 'VYAPRIX POS & Billing',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev && process.env.ELECTRON_START_URL) {
    mainWindow.loadURL(process.env.ELECTRON_START_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('get-hardware-id', async () => {
  return `WIN_${process.env.COMPUTERNAME || 'PC'}_${process.arch}`;
});

ipcMain.handle('sqlite-query', async (_event, collectionName) => {
  const db = readLocalDatabase();
  return db[collectionName] || [];
});

ipcMain.handle('sqlite-execute', async (_event, action, payload) => {
  const db = readLocalDatabase();
  if (action === 'save_invoice') {
    db.invoices = [payload, ...(db.invoices || []).filter((i) => i.id !== payload.id)];
    writeLocalDatabase(db);
    return { success: true };
  }
  if (action === 'save_sync_queue') {
    db.syncQueue = payload;
    writeLocalDatabase(db);
    return { success: true };
  }
  return { success: false, error: 'Unknown action' };
});

ipcMain.handle('print-receipt', async (_event, htmlContent) => {
  if (!mainWindow) return { success: false };
  let printWindow = new BrowserWindow({ show: false, width: 300, height: 600 });
  printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
  printWindow.webContents.on('did-finish-load', () => {
    printWindow.webContents.print({ silent: true, printBackground: true }, (success, errorType) => {
      printWindow.close();
      printWindow = null;
    });
  });
  return { success: true };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
