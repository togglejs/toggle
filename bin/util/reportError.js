'use strict';
var log = require('../../lib/util/log');
var chalk = require('chalk');

module.exports = function (msg) {
  log(chalk.red(msg));
  process.exit(1);
};
