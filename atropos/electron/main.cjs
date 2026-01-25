const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, Notification, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const chokidar = require('chokidar');

let mainWindow;
let tray = null;
let dataWatcher = null;
let isQuitting = false;
let Store;

const isDev = !app.isPackaged;
const MOIRAI_DATA = path.join(os.homedir(), 'Moirai_Data');
const TASKS_FILE = 'tasks.json';

// ─────────────────────────────────────────────
//  Encrypted Store (lazy init)
// ─────────────────────────────────────────────
let store = null;
async function getStore() {
    if (store) return store;
    try {
        const mod = await import('electron-store');
        Store = mod.default;
        store = new Store({
            encryptionKey: 'moirai-local-key-v1',
            schema: {
                apiKey: { type: 'string', default: '' },
                demoMode: { type: 'boolean', default: false },
                autoLaunch: { type: 'boolean', default: false },
                tokenBudget: {
                    type: 'object',
                    properties: {
                        dailyLimit: { type: 'number', default: 100000 },
                        monthlyLimit: { type: 'number', default: 2000000 },
                        dailyUsed: { type: 'number', default: 0 },
                        monthlyUsed: { type: 'number', default: 0 },
                        lastResetDay: { type: 'string', default: '' },
                        lastResetMonth: { type: 'string', default: '' },
                    },
                    default: {},
                },
            },
        });
    } catch (e) {
        console.error('Failed to initialize electron-store:', e);
        store = {
            _data: {},
            get: (key, def) => store._data[key] ?? def,
            set: (key, val) => { store._data[key] = val; },
            delete: (key) => { delete store._data[key]; },
        };
    }
    return store;
}

// ─────────────────────────────────────────────
//  Window
// ─────────────────────────────────────────────
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 500,
        backgroundColor: '#D0BA98',
        titleBarStyle: 'hiddenInset',
        frame: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        show: false,
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });
}

// ─────────────────────────────────────────────
//  System Tray
// ─────────────────────────────────────────────
function createTray() {
    const iconPath = path.join(__dirname, 'tray-icon.png');
    tray = new Tray(nativeImage.createFromPath(iconPath));

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show Moirai',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                }
            }
        },
        {
            label: 'Pause Tracking',
            type: 'checkbox',
            checked: false,
            click: (item) => {
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('tracking-paused', item.checked);
                }
            }
        },
        { type: 'separator' },
        {
            label: 'Quit Moirai',
            click: () => {
                isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('Moirai — The Narrative OS');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
        if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
        }
    });
}

// ─────────────────────────────────────────────
//  Real-time File Watcher
// ─────────────────────────────────────────────
function startDataWatcher() {
    dataWatcher = chokidar.watch(MOIRAI_DATA, {
        ignored: /(^|[\/\\])\../,
        persistent: true,
        ignoreInitial: true,
        depth: 10,
        awaitWriteFinish: {
            stabilityThreshold: 300,
            pollInterval: 100,
        },
    });

    dataWatcher.on('change', (filePath) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('data-changed', {
                path: filePath,
                type: 'change',
            });
        }
    });

    dataWatcher.on('add', (filePath) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('data-changed', {
                path: filePath,
                type: 'add',
            });
        }
    });

    dataWatcher.on('error', (err) => {
        console.error('Watcher error:', err);
    });
}

// ─────────────────────────────────────────────
//  File System Helpers
// ─────────────────────────────────────────────
async function getDataRoot() {
    const s = await getStore();
    const demo = s.get('demoMode', false);
    if (demo) {
        return isDev
            ? path.join(__dirname, '..', 'assets', 'demo_data')
            : path.join(process.resourcesPath, 'assets', 'demo_data');
    }
    return MOIRAI_DATA;
}

async function findLatestDataFolder(dir) {
    let latestDate = null;
    let latestPath = null;

    async function scan(currentDir) {
        try {
            const entries = await fs.readdir(currentDir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                if (entry.isDirectory()) {
                    if (/^\d{4}-\d{2}-\d{2}$/.test(entry.name)) {
                        if (!latestDate || entry.name > latestDate) {
                            latestDate = entry.name;
                            latestPath = fullPath;
                        }
                    } else {
                        await scan(fullPath);
                    }
                }
            }
        } catch (e) {
            // Ignore permission errors
        }
    }

    await scan(dir);
    return latestPath;
}

// ─────────────────────────────────────────────
//  Demo Mode Initialization (New Logic)
// ─────────────────────────────────────────────
async function ensureDemoData() {
    const demoRoot = isDev
        ? path.join(__dirname, '..', 'assets', 'demo_data')
        : path.join(process.resourcesPath, 'assets', 'demo_data');

    const userFile = path.join(demoRoot, 'user.json');

    try {
        await fs.mkdir(demoRoot, { recursive: true });
    } catch (e) { /* ignore */ }

    // Create default user if missing
    try {
        await fs.access(userFile);
    } catch {
        const defaultUser = {
            name: "Demo User",
            dob: "2000-01-01",
            profession: "Digital Architect",
            interests: "Coding, Design, Synthwave"
        };
        await fs.writeFile(userFile, JSON.stringify(defaultUser, null, 2));
    }
}

// ─────────────────────────────────────────────
//  IPC Handlers — Telemetry & Data
// ─────────────────────────────────────────────
ipcMain.handle('read-latest-telemetry', async () => {
    try {
        const root = await getDataRoot();
        const dailyPath = await findLatestDataFolder(root);
        if (!dailyPath) return { error: "No data found. Please run Clotho first." };

        const jsonPath = path.join(dailyPath, 'raw_telemetry.json');
        const data = await fs.readFile(jsonPath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading telemetry:", err);
        return { error: err.message };
    }
});

ipcMain.handle('read-daily-summary', async () => {
    try {
        const root = await getDataRoot();
        const dailyPath = await findLatestDataFolder(root);
        if (!dailyPath) return { error: "No data found." };

        const mdPath = path.join(dailyPath, 'daily_summary.md');
        try { await fs.access(mdPath); } catch {
            return { error: "No summary found. Run Lachesis first." };
        }
        const content = await fs.readFile(mdPath, 'utf-8');
        return { content };
    } catch (err) {
        console.error("Error reading summary:", err);
        return { error: err.message };
    }
});

ipcMain.handle('get-calendar-data', async () => {
    try {
        const root = await getDataRoot();
        const calendarData = [];
        const currentYear = new Date().getFullYear();

        async function scanDirectory(dir) {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        if (/^\d{4}-\d{2}-\d{2}$/.test(entry.name)) {
                            const jsonPath = path.join(fullPath, 'raw_telemetry.json');
                            try {
                                const content = await fs.readFile(jsonPath, 'utf-8');
                                const data = JSON.parse(content);
                                calendarData.push({
                                    date: entry.name,
                                    flow: data.metrics?.flow_score_estimate || 0,
                                    keystrokes: data.metrics?.total_keystrokes || 0
                                });
                            } catch (e) { }
                        } else {
                            await scanDirectory(fullPath);
                        }
                    }
                }
            } catch (e) { }
        }

        await scanDirectory(root);
        return calendarData;
    } catch (err) {
        console.error("Error scanning calendar:", err);
        return [];
    }
});

ipcMain.handle('get-user-profile', async () => {
    try {
        const root = await getDataRoot();
        const userPath = path.join(root, 'user.json');
        try {
            await fs.access(userPath);
            const data = await fs.readFile(userPath, 'utf-8');
            return JSON.parse(data);
        } catch { return null; }
    } catch { return null; }
});

ipcMain.handle('save-user-profile', async (event, userData) => {
    try {
        const root = await getDataRoot();
        await fs.mkdir(root, { recursive: true });
        const userPath = path.join(root, 'user.json');
        await fs.writeFile(userPath, JSON.stringify(userData, null, 2));
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('get-tasks', async () => {
    try {
        const root = await getDataRoot();
        const tasksPath = path.join(root, TASKS_FILE);
        try {
            const data = await fs.readFile(tasksPath, 'utf-8');
            return JSON.parse(data);
        } catch {
            return { groups: [{ id: 'general', name: 'General' }], tasks: [] };
        }
    } catch (err) {
        console.error(err);
        return { error: err.message };
    }
});

ipcMain.handle('save-tasks', async (event, data) => {
    try {
        const root = await getDataRoot();
        await fs.mkdir(root, { recursive: true });
        const tasksPath = path.join(root, TASKS_FILE);
        await fs.writeFile(tasksPath, JSON.stringify(data, null, 2));
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// ─────────────────────────────────────────────
//  IPC Handlers — Auto-Launch
// ─────────────────────────────────────────────
ipcMain.handle('get-auto-launch', async () => {
    const s = await getStore();
    return s.get('autoLaunch', false);
});

ipcMain.handle('set-auto-launch', async (_event, enabled) => {
    try {
        app.setLoginItemSettings({
            openAtLogin: enabled,
            path: process.execPath,
        });
        const s = await getStore();
        s.set('autoLaunch', enabled);
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// ─────────────────────────────────────────────
//  IPC Handlers — Notifications
// ─────────────────────────────────────────────
ipcMain.handle('send-notification', async (_event, { title, body }) => {
    try {
        if (Notification.isSupported()) {
            const notif = new Notification({ title, body, icon: path.join(__dirname, 'tray-icon.png') });
            notif.show();
            return { success: true };
        }
        return { success: false, error: 'Notifications not supported' };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// ─────────────────────────────────────────────
//  IPC Handlers — Demo Mode
// ─────────────────────────────────────────────
ipcMain.handle('set-demo-mode', async (_event, enabled) => {
    const s = await getStore();
    s.set('demoMode', enabled);
    if (enabled) await ensureDemoData(); // Ensure data exists
    return { success: true };
});

ipcMain.handle('get-demo-mode', async () => {
    const s = await getStore();
    return s.get('demoMode', false);
});

// ─────────────────────────────────────────────
//  IPC Handlers — API Key Storage
// ─────────────────────────────────────────────
ipcMain.handle('set-api-key', async (_event, key) => {
    try {
        const s = await getStore();
        s.set('apiKey', key);
        process.env.GROQ_API_KEY = key;
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('get-api-key', async () => {
    const s = await getStore();
    const key = s.get('apiKey', '');
    if (key) {
        return { hasKey: true, masked: key.slice(0, 6) + '••••••' + key.slice(-4) };
    }
    return { hasKey: false, masked: '' };
});

ipcMain.handle('delete-api-key', async () => {
    const s = await getStore();
    s.delete('apiKey');
    delete process.env.GROQ_API_KEY;
    return { success: true };
});

// ─────────────────────────────────────────────
//  IPC Handlers — Data Backup & Export
// ─────────────────────────────────────────────
ipcMain.handle('export-data', async () => {
    try {
        const { filePath } = await dialog.showSaveDialog(mainWindow, {
            title: 'Export Moirai Data',
            defaultPath: `moirai_backup_${new Date().toISOString().slice(0, 10)}.zip`,
            filters: [{ name: 'Moirai Backup', extensions: ['zip'] }],
        });

        if (!filePath) return { success: false, error: 'Cancelled' };

        const archiver = require('archiver');
        const fsSync = require('fs');
        const output = fsSync.createWriteStream(filePath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        return new Promise((resolve) => {
            output.on('close', () => resolve({ success: true, path: filePath, size: archive.pointer() }));
            archive.on('error', (err) => resolve({ success: false, error: err.message }));
            archive.pipe(output);
            archive.directory(MOIRAI_DATA, 'Moirai_Data');
            archive.finalize();
        });
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('import-data', async () => {
    try {
        const { filePaths } = await dialog.showOpenDialog(mainWindow, {
            title: 'Import Moirai Backup',
            filters: [{ name: 'Moirai Backup', extensions: ['zip'] }],
            properties: ['openFile'],
        });

        if (!filePaths || filePaths.length === 0) return { success: false, error: 'Cancelled' };

        const AdmZip = require('adm-zip');
        const zip = new AdmZip(filePaths[0]);
        zip.extractAllTo(os.homedir(), true);
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// ─────────────────────────────────────────────
//  Deep Linking Protocol Handler
// ─────────────────────────────────────────────
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (_event, commandLine) => {
        const url = commandLine.find(arg => arg.startsWith('moirai://'));
        if (url && mainWindow) {
            mainWindow.show();
            mainWindow.focus();
            mainWindow.webContents.send('deep-link', url);
        } else if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
        }
    });
}

// ─────────────────────────────────────────────
//  Auto-Updater
// ─────────────────────────────────────────────
function setupAutoUpdater() {
    try {
        const { autoUpdater } = require('electron-updater');

        autoUpdater.autoDownload = false;
        autoUpdater.autoInstallOnAppQuit = true;

        autoUpdater.on('update-available', (info) => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('update-available', {
                    version: info.version,
                    releaseNotes: info.releaseNotes,
                });
            }
        });

        autoUpdater.on('update-downloaded', () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('update-downloaded');
            }
        });

        autoUpdater.on('error', (err) => {
            console.error('Auto-updater error:', err);
        });

        setTimeout(() => {
            autoUpdater.checkForUpdates().catch(() => { });
        }, 5000);

        ipcMain.handle('check-for-updates', async () => {
            try {
                const result = await autoUpdater.checkForUpdates();
                return { available: !!result.updateInfo, version: result.updateInfo?.version };
            } catch (err) {
                return { available: false, error: err.message };
            }
        });

        ipcMain.handle('download-update', async () => {
            try {
                await autoUpdater.downloadUpdate();
                return { success: true };
            } catch (err) {
                return { success: false, error: err.message };
            }
        });

        ipcMain.handle('install-update', () => {
            isQuitting = true;
            autoUpdater.quitAndInstall();
        });
    } catch (err) {
        console.log('Auto-updater not available (dev mode):', err.message);
    }
}

// ─────────────────────────────────────────────
//  App Lifecycle
// ─────────────────────────────────────────────
app.setAsDefaultProtocolClient('moirai');

app.whenReady().then(async () => {
    const s = await getStore();
    const savedKey = s.get('apiKey', '');
    if (savedKey) {
        process.env.GROQ_API_KEY = savedKey;
    }

    createWindow();
    createTray();
    startDataWatcher();
    setupAutoUpdater();
});

app.on('before-quit', () => {
    isQuitting = true;
    if (dataWatcher) {
        dataWatcher.close();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});