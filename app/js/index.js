'use strict';

const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const remote = electron.remote;

const Menu = remote.Menu;
const cred = remote.require('./app/js/cred.js');
const settings = remote.require('./app/js/settings.js');
const login = remote.require('./app/js/login.js');
const evaluation = remote.require('./app/js/eval.js');
const scheduler = remote.require('./app/js/scheduler.js')();

let credObj = cred.get();
let model = {
  loggingIn: false,
  loggedIn: false,
  evalInProgress: false,
  completedNum: 0,
  error: null,
  status: '',
  uid: credObj ? credObj.uid : null,
  pin: credObj ? credObj.pin : null,
  lastRun: settings.get('lastRun'),
  items: []
};
let vm;

Vue.filter('time', function (millisecond) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = new Date(millisecond);

  function pad(value) {
    return value.toString().length === 1 ? `0${value}` : value;
  }

  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
});

vm = new Vue({
  el: 'body',
  data: model,
  methods: {
    login: function () {
      if (this.loggingIn) {
        return;
      }

      if (!this.uid || !this.pin) {
        this.status = 'Please enter both UID and PIN';
      } else {
        this.loggingIn = true;
        this.loggedIn = false;
        this.status = 'Logging in...';
        login.login(this.uid, this.pin)
          .then(() => {
            this.loggingIn = false;
            this.loggedIn = true;
            this.status = '';

            vm.$emit('loggedIn');

            // Save uid and pin to cred
            settings.set('uid', this.uid);
            cred.set(this.uid, this.pin);

            // Grab evaluation items
            evaluation.getList().then(items => {
              this.items = items;
              this.completedNum = 0;
              this.doEvaluation();
            });
          }, e => {
            console.error(e);
            this.loggingIn = false;
            this.status = 'Login failed';
          });
      }
    },
    doEvaluation: function () {
      if (this.evalInProgress) {
        return;
      }

      let _do = index => {
        if (index >= this.items.length ||
            (process.env.NODE_ENV === 'development' && index === 1)) {
          this.evalInProgress = false;
          scheduler.setLastRun(Date.now());
          scheduler.start();
          new Notification('EVZ', {
            body: `${this.status}`
          });
          return;
        }

        this.evalInProgress = true;

        evaluation.evalItem(this.items[index].id, 3)
          .then(() => {
            vm.$set(`items[${index}].done`, true);
            vm.$set(`items[${index}].error`, false);

            this.status = `Completed ${++this.completedNum} / ${this.items.length}`;

            _do(index+1);
          }, () => {
            vm.$set(`items[${index}].error`, true);
            _do(index+1);
          });
      };

      _do(0);
    }
  }
});

// Set up event listener for scheduler calling
vm.$on('do-eval', () => vm.login());
ipcRenderer.on('do-eval', () => vm.$emit('do-eval'));

// Build menu
let menuTemplate = [{
  label: 'Logout',
  enabled: false,
  click: function () {
    vm.$emit('logout');
  }
}, {
  label: 'Evaluate now',
  enabled: false,
  click: vm.login
}, {
  label: 'Start at login',
  type: 'checkbox',
  checked: true,
  click: function (item) {
    // Toggle startAtLogin with auto-launch in main process
    ipcRenderer.send('startAtLogin', item.checked);
  }
}, {
  label: 'Quit',
  click: () => ipcRenderer.send('quit-app')
}];
let menu = Menu.buildFromTemplate(menuTemplate);

vm.$set('showMenu', function() {
  menu.popup(remote.getCurrentWindow());
});

// Main process will pass in a promise resolving to the status
// of the startAtLogin, if not enabled then we turn off the check
// icon in the menu
ipcRenderer.on('setStartAtLoginIcon', (e, isEnabled) => {
  if (!isEnabled) {
    menuTemplate[2].checked = false;
    menu = Menu.buildFromTemplate(menuTemplate);
  }
});

// On login, enable the evaluation and logout items
vm.$on('loggedIn', function () {
  menuTemplate[0].enabled = true;
  menuTemplate[1].enabled = true;
  menu = Menu.buildFromTemplate(menuTemplate);
});

vm.$on('logout', function () {
  this.loggedIn = false;
  menuTemplate[0].enabled = false;
  menuTemplate[1].enabled = false;
  menu = Menu.buildFromTemplate(menuTemplate);

  vm.uid = '';
  vm.pin = '';
  vm.status = '';
  cred.remove();
});

// Login if creds are populated
if (vm.uid && vm.pin) {
  vm.login();
}
