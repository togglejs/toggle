#!/usr/bin/env node
'use strict';

var Liftoff = require('liftoff');
var tildify = require('tildify');
var semver = require('semver');
var reportError = require('./utils/reportError');
var lintConfig = require('./commands/lint').lintConfig;
var glob = require('glob');
var log = require('../lib/utils/log.js');
var path = require('path');

var Toggle = new Liftoff({
    name: 'toggle',
    //  localDeps: ['hacker'],     // these are assigned
    //  configName: 'hackerfile',  // automatically by
    //  processTitle: 'hacker',    // the "name" option
    cwdOpt: 'cwd',
    requireOpt: 'require'
}).on('require', function (name, module) {
    if (name === 'coffee-script') {
        module.register();
    }
}).on('requireFail', function (name, err) {
    console.log('Unable to load:', name, err);
});



Toggle.launch(launcher);

function launcher (env) {
    if(env.argv.verbose) {
        console.log('LIFTOFF SETTINGS:', this);
        console.log('CLI OPTIONS:', env.argv);
        console.log('CWD:', env.cwd);
        console.log('LOCAL MODULES PRELOADED:', env.preload);
        console.log('EXTENSIONS RECOGNIZED:', env.validExtensions);
        console.log('SEARCHING FOR:', env.configNameRegex);
        console.log('FOUND CONFIG AT:',  env.configPath);
        console.log('CONFIG BASE DIR:', env.configBase);
        console.log('YOUR LOCAL MODULE IS LOCATED:', env.modulePath);
        console.log('LOCAL PACKAGE.JSON:', env.modulePackage);
        console.log('CLI PACKAGE.JSON', require('../package'));
    }

    if (!env.modulePath) {
        reportError('No local ' + this.moduleName + '.json found in' + tildify(env.cwd) + "/n" + 'Try running: npm install ' + this.moduleName);
    }

    if (!env.configPath) {
        reportError('No local ' + this.configName + '.json found in' + tildify(env.cwd));
        // TODO: link out to some documentation on how create a togglefile.json
        process.exit(1);
    }

    var cliPackage = require('../package');

    // check for semver difference between cli and local installation
    if (semver.gt(cliPackage.version, env.modulePackage.version)) {
        gutil.log(chalk.red('Warning: ' + this.moduleName + ' version mismatch:'));
        gutil.log(chalk.red('Running ' + this.moduleName + ' is', cliPackage.version));
        gutil.log(chalk.red('Local ' + this.moduleName + ' (installed in dir) is', env.modulePackage.version));
    }

    if(env.configPath) {
        process.chdir(env.configBase);
        env.toggleConfig = require(env.configPath);

        // don't lint the current folder's config if calling the built-in 'lint' command
        if(!(process.argv && (process.argv[2]||'').toLowerCase() === 'lint')) {
            lintConfig(env.toggleConfig, env.configPath, "ignoreFriendlyOKmsg");
        }

        processCLI(env);

        var gulpInst = require(env.modulePath);

    } else {
        console.log('No togglefile.js found.');
    }
}



function processCLI(env){

    var program = require('commander');
    var config = env.toggleConfig;

    function loadCommand(command){
        require(command)(program, env);
    };


    // TODO:
    program.version('0.0.1')

    // load built-in commands
    glob.sync(__dirname + "/commands/**/*.js").forEach(loadCommand);

    // load custom commands
    var customCommandsPath = config.customCLICommandsPath;
    if(customCommandsPath) {
        log("Loading custom commands in " + customCommandsPath);
        glob.sync(customCommandsPath).forEach(function (cmd) {
            log("Loading custom command : " + cmd);
            loadCommand(path.join(process.cwd(), cmd));
            log("Success loading command: " + cmd);
        });
    }

    program.parse(process.argv);
}
