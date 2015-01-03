'use strict';
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

module.exports = function (program, env) { //jshint ignore:line

  program
    .command('completion [shell]')
    .description('Prints completion options OR the shell specific config')
//    .option('-o, --option <someOption>', 'TODO: add optional command options...')
    .action(function (shell, options) { //jshint ignore:line

      if(shell) {
        var filePath = path.join(__dirname, "completion", (shell || '').toLowerCase());
        if(fs.existsSync(filePath)) {
          console.log(fs.readFileSync(filePath).toString());
        } else {
          console.error(chalk.red("ERROR: file path not found:", filePath));
        }
      } else {

        var commands = program.commands
          .map(function (cmd) {
            return cmd._name;
          })
          .sort(function (a, b) {
            a = a || '';
            b = b || '';
            if (a.toLowerCase() < b.toLowerCase()) {
              return -1;
            }
            if (a.toLowerCase() > b.toLowerCase()) {
              return 1;
            }
            return 0;
          })
          .join('\n');

        console.log(commands);
      }
    });
};
