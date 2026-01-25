const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // ── Calendar ──
    getCalendarData: () => ipcRenderer.invoke('get-calendar-data'),

    // ── Telemetry ──
    readLatestTelemetry: () => ipcRenderer.invoke('read-latest-telemetry'),
    readDailySummary: () => ipcRenderer.invoke('read-daily-summary'),

    // ── User Profile ──
    getUserProfile: () => ipcRenderer.invoke('get-user-profile'),
    saveUserProfile: (data) => ipcRenderer.invoke('save-user-profile', data),

    // ── Tasks ──
    getTasks: () => ipcRenderer.invoke('get-tasks'),
    saveTasks: (data) => ipcRenderer.invoke('save-tasks', data),

    // ── Real-time Data Watcher ──
    onDataChange: (callback) => {
        const handler = (_event, data) => callback(data);
        ipcRenderer.on('data-changed', handler);
        return () => ipcRenderer.removeListener('data-changed', handler);
    },

    // ── Tracking Pause State ──
    onTrackingPaused: (callback) => {
        const handler = (_event, isPaused) => callback(isPaused);
        ipcRenderer.on('tracking-paused', handler);
        return () => ipcRenderer.removeListener('tracking-paused', handler);
    },

    // ── Auto-Launch ──
    getAutoLaunch: () => ipcRenderer.invoke('get-auto-launch'),
    setAutoLaunch: (enabled) => ipcRenderer.invoke('set-auto-launch', enabled),

    // ── Notifications ──
    sendNotification: (title, body) => ipcRenderer.invoke('send-notification', { title, body }),

    // ── Demo Mode ──
    setDemoMode: (enabled) => ipcRenderer.invoke('set-demo-mode', enabled),
    getDemoMode: () => ipcRenderer.invoke('get-demo-mode'),

    // ── API Key Storage ──
    setApiKey: (key) => ipcRenderer.invoke('set-api-key', key),
    getApiKey: () => ipcRenderer.invoke('get-api-key'),
    deleteApiKey: () => ipcRenderer.invoke('delete-api-key'),

    // ── Data Backup & Export ──
    exportData: () => ipcRenderer.invoke('export-data'),
    importData: () => ipcRenderer.invoke('import-data'),

    // ── Deep Linking ──
    onDeepLink: (callback) => {
        const handler = (_event, url) => callback(url);
        ipcRenderer.on('deep-link', handler);
        return () => ipcRenderer.removeListener('deep-link', handler);
    },

    // ── Auto-Updater ──
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    downloadUpdate: () => ipcRenderer.invoke('download-update'),
    installUpdate: () => ipcRenderer.invoke('install-update'),
    onUpdateAvailable: (callback) => {
        const handler = (_event, info) => callback(info);
        ipcRenderer.on('update-available', handler);
        return () => ipcRenderer.removeListener('update-available', handler);
    },
    onUpdateDownloaded: (callback) => {
        const handler = () => callback();
        ipcRenderer.on('update-downloaded', handler);
        return () => ipcRenderer.removeListener('update-downloaded', handler);
    },
});