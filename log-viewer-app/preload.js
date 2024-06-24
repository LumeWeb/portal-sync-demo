const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('backend', {
    loadLog: (id) => ipcRenderer.invoke('loadLog', id),
    openDialog: (method, config) => ipcRenderer.invoke('dialog', method, config)
})
