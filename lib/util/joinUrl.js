'use strict';


module.exports = function () {


  /**
  The `joinUrl` utility works much like the node `path.join(...)` works, but for URL's.

  ```
  var tog = require('toggle');
  tog.util.joinUrl("blog/dir", "index.html") === "blog/dir/index.html"
  ```
  @returns {String} result of joining url fragments with a `/`
  @api public
  */

  var originalArgs = Array.prototype.slice.call(arguments, 0).map(function(item) {
    return (item || '').replace(/\\/g, '/');
  }).filter(function (item) {
    return !!item;
  });

  var parts = originalArgs.filter(function (item) {
    // ignore slashed-only items
    return item !== '/';
  }).map(function (item) {

    // backslash to forwardslash

    if (item[0] === '/') {
      item = item.slice(1);
    }

    if (item[item.length - 1] === '/') {
      item = item.slice(0, item.length - 1);
    }

    return item;
  });

  var result = parts.join('/');

  // add the start slash back on (if it was there originally)
  if (originalArgs[0][0] === '/') {
    result = '/' + result;
  }

  // add the end slash back on (if it was there originally)
  var last = originalArgs[originalArgs.length - 1];
  if (last[last.length - 1] === '/') {
    result = result + '/';
  }

  return result;
};
