'use strict';
var reportError = require('../util/reportError');
var log = require('../../lib/util/log.js');
var fs = require('fs');
var path = require('path');

function lintConfig(config, configPath, ignoreFriendlyOKmsg) {
  var errors = [
    '\n\nThe following error(s) were found with your config in ' + configPath,
    ''
  ];

  if (!config) {
    reportError('Config was not loaded correctly [' + configPath + ']');
  }

  if (!config.templates) {
    errors.push('{\n  templates: { } \n} is not defined');
  }

  if (!config.paths) {
    errors.push('{\n  paths: { } \n} is not defined');
  } else {
    if (!config.paths.posts) {
      errors.push('{\n  paths: { posts: "??? directory ???" } \n} is not defined');
    }
  }

  errors.push('');

  if (errors.length > 3) {
    reportError(errors.join('\n'));
  } else {
    if (!ignoreFriendlyOKmsg) {
      log('togglefile [' + configPath + '] looks to be in good shape!');
    }
  }
}

var exp = function (program, env) {
  program
    .command('lint [togglefile]')
    .description('Inspects the togglefile for any issues.')
    .action(function (togglefile, options) { //jshint ignore:line

      // someone passed in a specific file to check
      if (togglefile) {
        togglefile = path.resolve(env.configBase, togglefile);
      } else {
        togglefile = env.configPath;
      }

      if (!togglefile || !fs.existsSync(togglefile)) {
        reportError('Cannot find togglefile.json');
      }

      var config = require(togglefile);

      lintConfig(config, togglefile);
    });
};

exp.lintConfig = lintConfig;
module.exports = exp;
