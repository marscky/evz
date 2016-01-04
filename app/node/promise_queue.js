'use strict';

// From https://www.promisejs.org/api/
Promise.prototype['finally'] = function (f) {
  return this.then(function (value) {
    return Promise.resolve(f()).then(function () {
      return value;
    });
  }, function (err) {
    return Promise.resolve(f()).then(function () {
      throw err;
    });
  });
};

/**
 * Creates a promise queue, ensuring that every promise is handled in sequence.
 */
function PromiseQueue () {
  var queue = [];
  var inProgress = false;

  /**
   * Add a function that returns a promise or a promise to the queue.
   * @param {function|promise} toPromise
   */
  this.add = function (nextItem) {
    if (typeof nextItem === 'function' || nextItem instanceof Promise) {
      queue.push(nextItem);
    }
    this.run();
  };

  /**
   * Run items in queue one by one.
   */
  this.run = function () {
    var _this = this;
    var nextItem, nextPromise;

    if (!inProgress && queue[0]) {
      inProgress = true;

      nextItem = queue.shift();

      // It's either function or promise, if function, invoke it.
      nextPromise = typeof nextItem === 'function' ? nextItem() : nextItem;

      return nextPromise.finally(function () {
        inProgress = false;
        _this.run();
      });
    }
  };
}

module.exports = PromiseQueue;
