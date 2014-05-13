var path = require('path');
var fs = require('node-fs');
var log = require('../../lib/utils/log.js');
var reportError = require('../utils/reportError');
var gulp = require('gulp');
var clean = require('gulp-clean');
var exec = require('child_process').exec;
var Q = require('q');

function system(cmd, callback) {
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
      .action(function (options) {

          var deployDir = path.resolve(env.toggleConfig.paths.deploy);
          var sourceDir = env.toggleConfig.paths.source;
          var deployType = env.toggleConfig.deployType;
          var deployGit = env.toggleConfig.deployGitUrl;

          var cwd = process.cwd();

          if (deployType === "githubpages") {

              function returnError() {
                  process.chdir(cwd);
              }

              function restOfWork(){

                  gulp.src([deployDir + "**/*", "!.git{,/**}"])
                    .pipe(clean())
                      .on('end', function () {
                          gulp.src(path.join(sourceDir, "**/*"))
                          .pipe(gulp.dest(deployDir))
                          .on('end', function () {

                              var cwd = process.cwd();
                              process.chdir(deployDir);

                              system('git add -A')
                                  .then(function () {
                                      return system('git commit -m "Updated site: ' + (new Date()).toUTCString() + '"');
                                  }).then(function () {
                                      return system('git pull --rebase origin master');
                                  }).then(function () {
                                      return system('git push origin master');
                                  }).then(function () {
                                      process.chdir(cwd);
                                  }).fail(function (error) {
                                      process.chdir(cwd);
                                      reportError(error);
                                  });
                          });
                      });
              }




              // setup deploy folder.
              if (!fs.existsSync(deployDir)) {
                  log("Deploy directory [" + deployDir + "] did not exist. Creating it...")
                  fs.mkdirSync(deployDir, 0777, true);
              }

              function gitInit() {
                  return ;
              }

              function gitRemoteAdd(callback) {
                  return ;
              }

              var cwd = process.cwd();
              process.chdir(deployDir);

              // setup git.
              var promise;
              if (!fs.existsSync(path.join(deployDir, ".git"))) {
                  promise = system("git init")
              } else {
                  var dfr = Q.defer();
                  dfr.resolve();
                  promise = dfr.promise;
              }

              promise
                  .then(function () {
                      return system("git remote add origin " + deployGit);
                  }).then(function () {
                      process.chdir(cwd);
                      return restOfWork();
                  }).fail(function (error) {
                      process.chdir(cwd);
                      reportError(error);
                  });


          } else {
              throw "Unknown deploy type [" + deployType + "]";
          }
      });
};