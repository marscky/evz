'use strict';

/**
 * Polyfill of a finally method.
 * @see https://www.promisejs.org/api/
 */
Promise.prototype.finally = Promise.prototype.finally || function(f) {
  return this.then(value => {
    return Promise.resolve(f()).then(() => value);
  }, err => {
    return Promise.resolve(f()).then(() => { throw err; });
  });
};

/**
 * Creates a promise queue, ensuring that every task/promise is handled in sequence.
 * @constructor
 */
function PromiseQueue () {
  let queue = [];
  let inProgress = false;

  /**
   * Add a function that returns a promise or add a promise to the queue.
   * @param {function|promise} toPromise
   */
  this.add = function (nextItem) {
    if (typeof nextItem === 'function' || nextItem instanceof Promise) {
      queue.push(nextItem);
    }
    return this.run();
  };

  /**
   * Run items in queue one by one.
   */
  this.run = function () {
    let nextItem, nextPromise;

    if (!inProgress && queue[0]) {
      inProgress = true;

      nextItem = queue.shift();

      // It's either function or promise, if function, invoke it.
      nextPromise = typeof nextItem === 'function' ? nextItem() : nextItem;

      return nextPromise.finally(() => {
        inProgress = false;
        this.run();
      });
    }
  };
}

module.exports = PromiseQueue;
