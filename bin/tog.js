#!/usr/bin/env node
'use strict';

var Liftoff = require('liftoff');
var gutil = require('gulp-util');
var chalk = require('chalk');
var tildify = require('tildify');
var semver = require('semver');

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
        gutil.log(chalk.red('No local ' + this.moduleName + ' install found in'), chalk.magenta(tildify(env.cwd)));
        gutil.log(chalk.red('Try running: npm install ' + this.moduleName));
        process.exit(1);
    }

    if (!env.configPath) {
        gutil.log(chalk.red('No local ' + this.configName + '.json found in'), chalk.magenta(tildify(env.cwd)));
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
        var config = require(env.configPath);

        if(!config.paths){
            gutil.log(chalk.red('No { paths: ...} property found in ' + env.configPath), chalk.magenta(tildify(env.cwd)));
            // TODO: link out to documentation
            process.exit(1);
        }

        //if(!config.paths.posts)

        var gulpInst = require(env.modulePath);

    } else {
        console.log('No togglefile.js found.');
    }
}