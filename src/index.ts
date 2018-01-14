import { app, BrowserWindow, dialog } from 'electron';

import Updater from './Updater';
import Expenses from './Expenses';
import { settings } from './Settings';

let mainWindow: Electron.BrowserWindow | null = null;

let _init = () => init((options: Electron.BrowserWindowConstructorOptions) => new BrowserWindow(options));

app.on('ready', _init);
app.on('activate', _init);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

export default function init(
  newBrowserWindow: (options: Electron.BrowserWindowConstructorOptions) => Electron.BrowserWindow
) {
  try {
    if (mainWindow === null) {
      Updater.autoCheckUpdate();
      Expenses.applyAutoTrans(() => {
        if (mainWindow) { mainWindow.loadURL(`file://${__dirname}/main.html`); }
      });

      settings.init();
      mainWindow = newBrowserWindow({
        icon: `${__dirname}/../assets/icon.png`,
        width: 800,
        height: 600,
      });

      mainWindow.loadURL(`file://${__dirname}/index.html`);

      mainWindow.on('closed', () => {
        mainWindow = null;
      });
    }
  } catch (error) {
    dialog.showErrorBox("Error", JSON.stringify(error));
    app.quit();
  }
}