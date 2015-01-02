'use strict';

var _ = require('lodash');
var moment = require('moment');

module.exports = function (site, opts) {
  if (!site) {
    throw 'first parameter {site} missing (required)';
  }

  var Page = function () { };

  Page.prototype = _.create(site, {
    index: true,
    comments: false,
    titlecase: false,
    page_header: true,
    page_meta: true,

    disqus: {
      show: false,
    }
  });

  Object.defineProperty(Page.prototype, 'date', {
    get: function () {
      return this._date && moment(this._date);
    },
    //set: function (value) {
    //  var parsedDate = moment(value);
    //  if (parsedDate.isValid()) {
    //    this._date = parsedDate;
    //  } else {
    //    console.error('INVALID Date: ' + value);
    //    // date not necessary for a page...
    //  }
    //},
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(Page.prototype, 'title', {
    get: function () {
      return this._title;
    },
    set: function (value) {
      this._title = value;
    },
    enumerable: true,
    configurable: true
  });

  var result = _.create(Page.prototype, opts);
  return result;
};
