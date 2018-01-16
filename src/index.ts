import { app, BrowserWindow, dialog } from 'electron';
import * as fs from 'fs';

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
      const centsaDir = `${app.getPath("home")}/.centsa`;
      try {
        fs.mkdirSync(centsaDir);
        fs.createReadStream(`${__dirname}/../assets/defaultsettings.json`)
          .pipe(fs.createWriteStream(`${centsaDir}/settings.json`));
        // TODO initialize new setup
      } catch (error) {
        if (error.code != 'EEXIST') throw error;
      }

      settings.init(centsaDir);

      Updater.autoCheckUpdate();
      Expenses.applyAutoTrans(() => {
        if (mainWindow) { mainWindow.loadURL(`file://${__dirname}/main.html`); }
      });

      mainWindow = newBrowserWindow({
        icon: `${__dirname}/../assets/icon.png`,
        width: settings.width,
        height: settings.height,
      });

      mainWindow.loadURL(`file://${__dirname}/index.html`);

      mainWindow.on('closed', () => {
        mainWindow = null;
      });

      let saveSize = () => {
        settings.width = mainWindow!.getSize()[0];
        settings.height = mainWindow!.getSize()[1];
        settings.save();
      };
      
      mainWindow.on("maximize", saveSize);
      mainWindow.on("unmaximize", saveSize);
      mainWindow.on("resize", saveSize);
    }
  } catch (error) {
    dialog.showErrorBox("Error", JSON.stringify(error));
    app.quit();
  }
}