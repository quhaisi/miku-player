const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getMusicList: () => ipcRenderer.invoke('dialog:openDirSelect'),
  getDefaultMusicList: path => ipcRenderer.invoke('dialog:getDefaultMusicList', path),
  handleMusicOperation: cb => ipcRenderer.on('musicOperation', cb),
  rmHandleMusicOperation: () => ipcRenderer.removeAllListeners('musicOperation')
})