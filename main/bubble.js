const { BrowserWindow, screen } = require('electron')
const path = require('path')

function createBubbleWindow() {
  const bubble = new BrowserWindow({
      width: 120, 
      height: 120,
      type: 'toolbar',
      frame: false,
      resizable: false,
      transparent: true,
      alwaysOnTop: true,
      webPreferences: {
        preload: path.join(__dirname, './preload.js')
      }
  });
  const { left, top } = { left: screen.getPrimaryDisplay().workAreaSize.width - 160, top: screen.getPrimaryDisplay().workAreaSize.height - 160 }
  bubble.setPosition(left, top)
  
  // TODO 后续看是否可以通过router修改加载逻辑，不行就用多页面
  bubble.loadFile(path.join(__dirname, '../renderer/index.html'))

  bubble.once('ready-to-show', () => {
    bubble.show()
  });

  bubble.on('close', () => {
    bubble = null;
  })
}

module.exports = {
  createBubbleWindow
}