'use strict';
var reportError = require('../util/reportError');
var log = require('../../lib/util/log.js');
var fs = require('fs');
var path = require('path');

module.exports = function (program, env) {
  program
    .command('newToggleCommand <toggleComandsFolder> <name>')
    .description('Can generate a new sample command that allows you to use tog to load and execute.')
    .action(function (folder, name, options) {

      if (!fs.existsSync(folder)) {
        reportError('Cannot find folder [' + folder + '] to save sample command plugin.');
      }

      var cmdText = fs.readFileSync(path.join(__dirname, '../util/sampleCommand.js')).toString();
      cmdText = cmdText.replace(/{{name}}/g, name);

      var outFile = path.join(folder, name + '.js');

      fs.writeFileSync(outFile, cmdText);

      log('Plugin scaffolded and saved to: ' + outFile);
    });
};
