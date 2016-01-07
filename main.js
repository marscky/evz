'use strict';

var ipcMain = require('electron').ipcMain;
var menubar = require('menubar');
var mb = menubar({
  dir: __dirname + '/app',
  icon: __dirname + '/app/IconTemplate.png',
  height: 400,
  width: 320,
  resizable: false,
  preloadWindow: true,
  showDockIcon: false
});

var settings = require('./app/node/settings.js');

var AutoLaunch = require('auto-launch');
var appLauncher = new AutoLaunch({ name: 'EVZ' });

function enableLauncher () {
  appLauncher.isEnabled(function (enabled) {
    if (enabled) { return; }
    appLauncher.enable();
  });
}

var _startAtLogin = settings.get('startAtLogin');
if (_startAtLogin === 'undefined' || _startAtLogin === true) {
  enableLauncher();
}

ipcMain.on('change-start', function (event, startAtLogin) {
  return startAtLogin ? enableLauncher() : appLauncher.disable();
});

ipcMain.on('quit-app', function () {
  mb.app.quit();
});

mb.on('after-create-window', function () {
  if (process.env.NODE_ENV === 'development') {
    mb.window.openDevTools();
  }
});

mb.on('ready', function () {
  // Pass in mb instance so that renderer process can receive message on scheduled runs
  require('./app/node/scheduler.js')(mb);

  mb.window.loadURL('file://' + __dirname + '/app/index.html');
});
