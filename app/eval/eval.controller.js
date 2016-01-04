(function () {
  'use strict';

  var electron = require('electron');
  var remote = electron.remote;
  var evaluation = remote.require('./app/node/eval.js');
  var scheduler = remote.require('./app/node/scheduler.js')();

  angular
    .module('evz.eval')
    .controller('EvalCtrl', EvalCtrl);

  EvalCtrl.$inject = ['$rootScope', '$scope'];

  /* @ngInject */
  function EvalCtrl ($rootScope, $scope) {
    var vm = this;

    var inProgress = false;
    var successCount = 0;
    var failCount = 0;

    vm.allComplete = false;
    vm.lastRun = '';
    vm.grabListError = '';

    /**
    * List of evaluation items
    * @type {Array}
    * @property {integer} id from grabEval
    * @property {string} title from grabEval
    * @property {boolean} inProgress
    * @property {boolean} done
    * @property {Error} error from doEval for this item
    */
    vm.list = [];

    vm.gotoLogin = function() {
      $rootScope.$emit('logout');
    };

    function _doList () {
      if (inProgress) { return; }

      console.log('Do list');

      successCount = 0;
      failCount = 0;
      _run(0);

      function _run (index) {
        // TESTING
        if (index >= vm.list.length ||
            vm.list[index].inProgress ||
            vm.list[index].done) {
          console.log('Stop run');

          var lastRun = moment();
          var lastRunStr = lastRun.format('D MMM HH:mm:ss');

          inProgress = false;

          $scope.$apply(function () {
            vm.allComplete = true;
            vm.lastRun = lastRunStr;
          });

          scheduler.setLastRun(lastRun.valueOf());
          scheduler.start();

          new Notification('EVZ', {
            body: `Success: ${successCount} / Fail: ${failCount}\nCompleted at ${lastRunStr}`
          });

          return;
        }

        console.log('Run', index);

        inProgress = true;

        $scope.$apply(function () {
          vm.list[index].inProgress = true;
        });

        evaluation.evalItem(vm.list[index].id, 3)
          .then(function () {
            console.log('doEval success');
            $scope.$apply(function () {
              vm.list[index].inProgress = false;
              vm.list[index].done = true;
            });
            ++successCount;
            _run(index+1);
          }, function (reason) {
            console.log('doEval fail');
            $scope.$apply(function () {
              vm.list[index].inProgress = false;
              vm.list[index].error = reason;
            });
            ++failCount;
            _run(index+1);
          });
      }
    }

    // Try to grab list and do eval when the view (and this controller) is loaded
    evaluation.getList()
      .then(function (list) {
        $scope.$apply(function () {
          vm.list = list;
        });

        _doList();
      }, function (reason) {
        $scope.$apply(function () {
          vm.grabListError = reason;

          if (!remote.getCurrentWindow().isVisible()) {
            // Notify user to log in
            new Notification('EVZ', {
              body: 'Please login to use EVZ.'
            });
          }
        });
      });
  }
})();
