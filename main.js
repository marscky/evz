'use strict';

const electron = require('electron');
const ipcMain = electron.ipcMain;
const menubar = require('menubar');
const AutoLaunch = require('auto-launch');

const settings = require('./app/js/settings.js');

const mb = menubar({
  dir: `${__dirname}/app`,
  icon: `${__dirname}/app/IconTemplate.png`,
  height: 380,
  width: 340,
  windowPosition: 'trayRight',
  resizable: false,
  preloadWindow: true,
  showDockIcon: false,
  tooltip: 'EVZ',
  alwaysOnTop: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'ui'
});

const appLauncher = new AutoLaunch({ name: 'EVZ' });

ipcMain.on('startAtLogin', function (event, startAtLogin) {
  return startAtLogin ? appLauncher.enable() : appLauncher.disable();
});

ipcMain.on('quit-app', function () {
  mb.app.quit();
});

mb.on('after-create-window', function () {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'ui') {
    mb.window.openDevTools();
  }

  if (!settings.get('lastRun')) {
    // First run, always enable
    appLauncher.enable().then(setStartAtLoginIcon);
  } else {
    setStartAtLoginIcon();
  }

  function setStartAtLoginIcon() {
    appLauncher.isEnabled().then(isEnabled => {
      // A timeout is necessary for the renderer process to be ready
      // for messages
      setTimeout(function () {
        mb.window.webContents.send('setStartAtLoginIcon', isEnabled);
      }, 1000);
    });
  }
});

mb.on('ready', () => {
  // Pass in mb instance so that renderer process can receive message on scheduled runs
  require('./app/js/scheduler.js')(mb);
  mb.window.loadURL(`file://${__dirname}/app/index.html`);
});
