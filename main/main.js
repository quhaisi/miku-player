const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron')
const path = require('path')
const { readdir } = require('node:fs/promises')
const { resourceLimits } = require('worker_threads')
const { createBubbleWindow } = require('./bubble')

function createWindow () {
  const mainWindow = new BrowserWindow({
    title: 'miku',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  mainWindow.setIcon(path.join(__dirname, '../public/icon/appIcon.png'))
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))


  const dockMenu = Menu.buildFromTemplate([
    {
      label: '播放',
      click: () => mainWindow.webContents.send('musicOperation', 'play')
    }, {
      label: '暂停',
      click: () => mainWindow.webContents.send('musicOperation', 'pause')
    }, {
      label: '上一首',
      click: () => mainWindow.webContents.send('musicOperation', 'prev')
    }, {
      label: '下一首',
      click: () => mainWindow.webContents.send('musicOperation', 'next')
    }
  ])

  if (process.platform === 'darwin') {
    app.dock.setMenu(dockMenu)
    app.dock.setIcon(path.join(__dirname, '../public/icon/appIcon.png'));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
  ipcMain.handle('dialog:openDirSelect', async (event) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({properties: ['openDirectory']})
    if(!canceled) {
      return JSON.stringify({musicList: await getMusicFromPath(filePaths[0]), path: filePaths[0]})
    } else {
      return JSON.stringify({canceled})
    }
  })
  ipcMain.handle('dialog:getDefaultMusicList', async (event, path) => {
    return await getMusicFromPath(path)
  })
  ipcMain.on('bubble:show', (event) => {
    createBubbleWindow()
  })
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

async function getMusicFromPath(dirPath) {
  try {
    const files = await readdir(dirPath);
    const result = []
    for (const file of files) {
      if((path.extname(file) == '.mp3')) {
        result.push(`${dirPath}/${file}`)
      }
    }
    return result
  } catch (err) {
    console.error(err);
  }
}
