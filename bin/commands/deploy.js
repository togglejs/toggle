'use strict';
var path = require('path');
var fs = require('node-fs');
var log = require('../../lib/util/log.js');
var reportError = require('../util/reportError');
var gulp = require('gulp');
var exec = require('child_process').exec;
var Q = require('q');

function system(cmd) {
    var deferred = Q.defer();
    log("system: " + cmd);
    child = exec(cmd, function (error, stdout, stderr) {

        if ((stdout || '').indexOf('nothing to commit, working directory clean') >= 0) {
            error = null;
        }

        if ((stderr || '').indexOf('remote origin already exists') >= 0) {
            error = null;
        }
        if ((stderr || '').indexOf('Couldn\'t find remote ref master') >= 0) {
            error = null;
        }
        if ((stderr || '').indexOf('ambiguous argument \'origin/master\': unknown revision or path not in the working tree.') >= 0) {
            error = null;
        }
        if ((stderr || '').indexOf('pathspec \'\' did not match any files') >= 0) {
            error = null;
        }


        if (error) {
            deferred.reject(new Error(error));
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
}

module.exports = function (program, env) {

    /*
     * TODO: document what env has that may be useful to a plugin develoepr.
     *
     * toggle leverages https://www.npmjs.org/package/commander for it's commands
     * You can review it's API https://github.com/visionmedia/commander.js to extend toggle with your own commands.
     *
     */

    program
      .command("deploy")
      .description("TODO: fill in command description")
      .option("-p, --nopush", "Do everything except push to the remote")
      .option("-c, --nocommit", "Do everything except commit & push to the remote")
      .action(function (options) {

          var nocommit = options.nocommit;
          var nopush = options.nopush || nocommit;

          var deployDir = path.resolve(env.toggleConfig.paths.deploy);
          var sourceDir = env.toggleConfig.paths.source;
          var deployType = env.toggleConfig.deployType;
          var deployGit = env.toggleConfig.deployGitUrl;

          var cwd = process.cwd();

          if (deployType === "githubpages") {

              function returnError() {
                  process.chdir(cwd);
              }

              function copyFiles() {
                  var deferred = Q.defer();

                  gulp.src(path.join(sourceDir, "**/*"))
                      .pipe(gulp.dest(deployDir))
                      .on('error', function (error) {
                          deferred.reject(new Error(error));
                      })
                      .on('end', function () {
                          deferred.resolve();
                      });

                  return deferred.promise;

              }

              // setup deploy folder.
              if (!fs.existsSync(deployDir)) {
                  log("Deploy directory [" + deployDir + "] did not exist. Creating it...")
                  fs.mkdirSync(deployDir, 0777, true);
              }


              var cwd = process.cwd();
              process.chdir(deployDir);

              // setup git.
              var promise;
              if (!fs.existsSync(path.join(deployDir, ".git"))) {
                  promise = system("git init")
              } else {
                  promise = Q.resolve();
              }

              promise
                  .then(function () {
                      return system("git remote add origin " + deployGit);
                  }).then(function () {
                      return system('git fetch origin');
                  }).then(function () {
                      return system('git reset origin/master --hard');
                  }).then(function () {
                      return system('git rm --cached -r .');
                  }).then(function () {
                      return system('git clean -fd');
                  }).then(function () {
                      process.chdir(cwd);
                      return copyFiles();
                  }).then(function () {
                      process.chdir(deployDir);
                      return system('git add -A')
                  }).then(function () {
                      if (nocommit) {
                          return Q.resolve();
                      }
                      return system('git commit -m "Updated site: ' + (new Date()).toUTCString() + '"');
                  }).then(function () {
                      if (nopush) {
                          return Q.resolve();
                      }
                      return system('git push origin master');
                  }).then(function () {
                      process.chdir(cwd);
                  }).fail(function (error) {
                      process.chdir(cwd);
                      reportError(error);
                  });

          } else {
              throw "Unknown deploy type [" + deployType + "]";
          }
      });
};
