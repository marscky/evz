(function () {
  'use strict';

  var remote = require('electron').remote;
  var cred = remote.require('./app/node/cred.js');
  var login = remote.require('./app/node/login.js');

  angular
    .module('evz.login')
    .controller('LoginCtrl', LoginCtrl);

  LoginCtrl.$inject = ['$rootScope', '$scope', '$state'];

  /* @ngInject */
  function LoginCtrl ($rootScope, $scope, $state) {
    var vm = this;

    // Whether this login uses credentials from store
    var isCredPopulated = false;

    vm.inProgress = false;
    vm.errorMessage = '';

    vm.closeModal = function () {
      vm.errorMessage = '';
    };

    vm.login = function () {
      if (vm.inProgress) { return; }

      console.log('Login called');

      vm.inProgress = true;
      login.login(vm.uid, vm.pin)
        .then(function () {
          console.log('Login success');

          if (!isCredPopulated) {
            cred.setCredentials(vm.uid, vm.pin);
          }

          // Allows cred.setCredentials to be called if subsequent login with a different set of credentials
          isCredPopulated = false;

          $rootScope.$emit('login', vm.uid);
          $state.go('eval');
        }, function (reason) {
          console.log('Login fail', reason);

          isCredPopulated = false;

          $scope.$apply(function () {
            vm.inProgress = false;
            vm.errorMessage = reason;
          });
        });
    };

    // Try to login when the view (and this controller) is loaded
    (function () {
      var info = cred.getCredentials();
      if (info.uid && info.pin) {
        console.log('Credentials found, trying to login');

        isCredPopulated = true;
        vm.uid = info.uid;
        vm.pin = info.pin;
        vm.login();
      }
    })();
  }
})();
