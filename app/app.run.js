(function () {
  'use strict';

  angular
    .module('evz')
    .run(runBlock);

  runBlock.$inject = ['$state'];

  function runBlock ($state) {
    $state.go('login');
  }
})();
