#!/usr/bin/env node
'use strict';

var Liftoff = require('liftoff');
var tildify = require('tildify');
var semver = require('semver');
var reportError = require('./utils/reportError');

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
        var config = require(env.configPath);

        if(!config.paths){
            reportError('No { paths: ...} property found in ' + env.configPath);
        }

        lintConfig(config, env.configPath);
        processCLI(config);

        //if(!config.paths.posts)

        var gulpInst = require(env.modulePath);

    } else {
        console.log('No togglefile.js found.');
    }
}

function lintConfig(config, configPath){
    var errors = [
        "\n\nThe following error(s) were found with your config in " + configPath,
        ""
    ];
    if(!config.templates){
        errors.push("{\n  templates: { } \n} is not defined");
    }

    if(!config.paths){
        errors.push("{\n  paths: { } \n} is not defined");
    }

    if(!config.paths.posts){
        errors.push("{\n  paths: { posts: \"??? directory ???\" } \n} is not defined");
    }

    errors.push("");

    if(errors.length > 3) {
        reportError(errors.join("\n"));
    }
}


function processCLI(config){

    var program = require('commander');

    // TODO:
    program.version('0.0.1')

    // load commands
    require('glob')
        .sync(__dirname + "/commands/**/*.js")
        .forEach(function(command){
            var c = require(command)(config);
            //console.log(c);

            var p = program
              .command(c.command)
              .description(c.description)
              .action(c.action);

            c.options.forEach(function (option) {
                p.option(option.option, option.description);
            })
        });

    program.parse(process.argv);
 //   program.help();
}