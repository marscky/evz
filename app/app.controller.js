(function () {
  'use strict';

  var electron = require('electron');
  var ipcRenderer = electron.ipcRenderer;
  var remote = electron.remote;

  var cred = remote.require('./app/node/cred.js');
  var settings = remote.require('./app/node/settings.js');
  var Menu = remote.Menu;
  var shell = require('shell');

  angular
    .module('evz')
    .controller('AppCtrl', AppCtrl);

  AppCtrl.$inject = ['$rootScope', '$state'];

  /* @ngInject */
  function AppCtrl ($rootScope, $state) {
    var vm = this;

    var isLoggedIn = false;

    var menuTemplate = [
      {
        label: 'Not logged in',
        enabled: false
      }, {
        label: 'Logout',
        enabled: false,
        click: function () {
          console.log('Logout');
          $rootScope.$emit('logout');
        }
      }, {
        label: 'Evaluate now',
        enabled: false,
        click: function () {
          console.log('Reload login');
          $state.go('login');
        }
      }, {
        label: 'Start at login',
        type: 'checkbox',
        checked: true,
        click: function (item) {
          settings.set('startAtLogin', item.checked);
          ipcRenderer.send('change-start', item.checked) ;
        }
      }, {
        label: 'Help',
        click: function () {
          shell.openExternal('https://github.com/marscky/evz');
        }
      }, {
        label: 'About',
        click: function () {
          shell.openExternal('https://github.com/marscky/evz');
        }
      }, {
        label: 'Quit',
        click: function () {
          ipcRenderer.send('quit-app');
        }
      }];

    var menu = Menu.buildFromTemplate(menuTemplate);

    vm.showMenu = function () {
      menu.popup(remote.getCurrentWindow());
    };

    $rootScope.$on('login', function (event, uid) {
      isLoggedIn = true;

      // Replace 'Not logged in' with currently signed in UID
      menuTemplate[0].label = uid;
      menuTemplate[1].enabled = true;
      menuTemplate[2].enabled = true;
      menu = Menu.buildFromTemplate(menuTemplate);
    });

    $rootScope.$on('logout', function () {
      isLoggedIn = false;

      // Replace 'Not logged in' with currently signed in UID
      menuTemplate[0].label = 'Not logged in';
      menuTemplate[1].enabled = false;
      menuTemplate[2].enabled = false;
      menu = Menu.buildFromTemplate(menuTemplate);

      cred.removeCredentials();
      $state.go('login');
    });

    ipcRenderer.on('do-eval', function () {
      console.log('do-eval channel');

      if (isLoggedIn) {
        // Try to do eval, by triggering the login flow again
        $state.go('login');
      } else {
        // Notify user to log in
        new Notification('EVZ', {
          body: 'Please login to use EVZ.'
        });
      }
    });
  }
})();
