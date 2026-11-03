// Electron main process. The renderer is the very same src/ that is
// hosted on the web: plain ES modules, no bundling step required.

import { app, BrowserWindow, Menu, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// `electron .` must not share localStorage (the saved fields) with an
// installed build, they would resolve to the same profile directory
if(!app.isPackaged) app.setPath('userData', `${app.getPath('userData')} (dev)`);

function CreateWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Thomson formula calculation',
    icon: path.join(root, 'electron', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  // links leaving the app open in the default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.loadFile(path.join(root, 'src', 'app.html'));

  return win;
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);

  CreateWindow();

  app.on('activate', () => {
    if(BrowserWindow.getAllWindows().length == 0) CreateWindow();
  });
});

app.on('window-all-closed', () => {
  if(process.platform != 'darwin') app.quit();
});
