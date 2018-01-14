import { app, BrowserWindow } from 'electron';

import Updater from './Updater';
import Expenses from './Expenses';
import { settings } from './Settings';


let mainWindow: Electron.BrowserWindow | null = null;

settings.init();
Updater.autoCheckUpdate();
Expenses.applyAutoTrans(() => {
  if (mainWindow) { mainWindow.loadURL(`file://${__dirname}/main.html`); }
});


const createWindow = async () => {
  if (mainWindow === null) {
    mainWindow = new BrowserWindow({
      icon: `${__dirname}/../assets/icon.png`,
      width: 800,
      height: 600,
    });

    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }
};

app.on('ready', createWindow);
app.on('activate', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

