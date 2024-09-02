const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    loadAccounts: () => ipcRenderer.invoke('load-accounts'),
    FolderOpen: () => ipcRenderer.invoke('folder-open')
});
