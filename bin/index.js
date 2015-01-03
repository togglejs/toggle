#!/usr/bin/env node
'use strict';

var Liftoff = require('liftoff');
var tildify = require('tildify');
var semver = require('semver');
var reportError = require('./util/reportError');
var lintConfig = require('./commands/lint').lintConfig;
var glob = require('glob');
var log = require('../lib/util/log.js');
var path = require('path');
var chalk = require('chalk');

var Toggle = new Liftoff({
  name: 'toggle',
  //  localDeps: ['hacker'],     // these are assigned
  //  configName: 'hackerfile',  // automatically by
  //  processTitle: 'hacker',    // the 'name' option
  cwdOpt: 'cwd',
  requireOpt: 'require'
}).on('require', function (name, module) {
  if (name === 'coffee-script') {
    module.register();
  }
}).on('requireFail', function (name, err) {
  log('Unable to load:', name, err);
});

var printHelpMessage = function(program, cliVersion, moduleVersion) {

  console.log('tog v' + cliVersion + ' local module v' + moduleVersion);
  program.help();

};

var launcher = function (env) {
  if (env.argv.verbose) {
    log('LIFTOFF SETTINGS:', this);
    log('CLI OPTIONS:', env.argv);
    log('CWD:', env.cwd);
    log('LOCAL MODULES PRELOADED:', env.preload);
    log('EXTENSIONS RECOGNIZED:', env.validExtensions);
    log('SEARCHING FOR:', env.configNameRegex);
    log('FOUND CONFIG AT:',  env.configPath);
    log('CONFIG BASE DIR:', env.configBase);
    log('YOUR LOCAL MODULE IS LOCATED:', env.modulePath);
    log('LOCAL PACKAGE.JSON:', env.modulePackage);
    log('CLI PACKAGE.JSON', require('../package'));
  }

  var isCompletion = env.argv._.indexOf('completion') >= 0;

  if (!env.modulePath && !isCompletion) {
    reportError('No local ' + this.moduleName + '.json found in' + tildify(env.cwd) + '/n' + 'Try running: npm install ' + this.moduleName);
  }

  if (!env.configPath && !isCompletion) {
    reportError('No local ' + this.configName + '.json found in' + tildify(env.cwd));
    // TODO: link out to some documentation on how create a togglefile.json
    process.exit(1);
  }

  var cliPackage = require('../package');

  // check for semver difference between cli and local installation
  if (env.modulePackage.version && semver.gt(cliPackage.version, env.modulePackage.version)) {
    console.log(chalk.red('Warning: ' + this.moduleName + ' version mismatch:'));
    console.log(chalk.red('Running ' + this.moduleName + ' is', cliPackage.version));
    console.log(chalk.red('Local ' + this.moduleName + ' (installed in dir) is', env.modulePackage.version));
  }

  if (env.configPath) {
    process.chdir(env.configBase);
    env.toggleConfig = require(env.configPath);

    // don't lint the current folder's config if calling the built-in 'lint' command
    if (!(process.argv && (process.argv[2]||'').toLowerCase() === 'lint')) {
      lintConfig(env.toggleConfig, env.configPath, 'ignoreFriendlyOKmsg');
    }

    processCLI(env, cliPackage.version, env.modulePackage.version, isCompletion);

    // TODO: not sure why this is here - it it necessary?
    var gulpInst = require(env.modulePath);  //jshint ignore:line

  } else {
    processCLI(env, cliPackage.version, env.modulePackage.version, isCompletion);
  }
};

function processCLI(env, cliVersion, moduleVersion, isCompletion){

  var program = require('commander');
  program.version(cliVersion);

  var loadCommand = function (command) {
    try {
      require(command)(program, env);
    } catch (variable) {
      console.log(chalk.red('Failed to load command: ' + command + '\nError: ' + variable));
    }
  };

  // load built-in commands
  glob.sync(__dirname + '/commands/**/*.js').forEach(loadCommand);

  var config = env.toggleConfig;
  if (config) {
    // load custom commands
    var customCommandsPath = config.customCLICommandsPath;
    if (customCommandsPath) {
      var loggedFirstCustomCommand = false;
      glob.sync(customCommandsPath).forEach(function (cmd) {
        if (!loggedFirstCustomCommand) {
          loggedFirstCustomCommand = true;
          if (!isCompletion) {
            log('Found custom commands' + customCommandsPath);
          }
        }
        if (!isCompletion) {
          log('Loading custom command : ' + cmd);
        }
        loadCommand(path.join(process.cwd(), cmd));
        if (!isCompletion) {
          log('Success loading command: ' + cmd);
        }
      });
    }
  }

  if (process.argv.length === 2) {
    printHelpMessage(program,  cliVersion, moduleVersion);
  } else {
    program.parse(process.argv);
  }
}

Toggle.launch(launcher);
