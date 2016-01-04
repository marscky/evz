(function() {
  'use strict';

  angular
    .module('evz')
    .config(configBlock);

  configBlock.$inject = ['$stateProvider'];

  function configBlock ($stateProvider) {
    $stateProvider
      .state('login', {
        controller: 'LoginCtrl as login',
        templateUrl: 'login/login.html'
      })
      .state('eval', {
        url: '/eval?url',
        controller: 'EvalCtrl as eval',
        templateUrl: 'eval/eval.html'
      });
  }
})();
