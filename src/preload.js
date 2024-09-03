const { contextBridge, ipcRenderer } = require('electron');
const Chart = require('chart.js')

contextBridge.exposeInMainWorld('electronAPI', {
    loadAccounts: () => ipcRenderer.invoke('load-accounts'),
    FolderOpen: () => ipcRenderer.invoke('folder-open'),
    SaveFile: (filename, data) => ipcRenderer.invoke('save-file', filename, data),
    Chart: Chart
});
