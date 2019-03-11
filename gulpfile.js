'use strict';

var gulp = require('gulp');
var gulp   = require('gulp');
var $ = require('gulp-load-plugins')();
var shelljs = require('shelljs');
var opn = require('opn');

var exec = function (cmd) {
  console.log('Running command: ' + cmd);
  var result = shelljs.exec(cmd);
  if (result.code !== 0) {
    console.error('Error running command: ' + cmd);
    throw JSON.stringify(result);
  }
};

var plumberConfig = {};

var paths = {
  lint: ['./gulpfile.js', './lib/**/*.js', './bin/**/*.js'],
  watch: ['./gulpfile.js', './lib/**', './test/**/*.js', '!test/{temp,temp/**}'],
  tests: ['./test/**/*.js', '!test/{temp,temp/**}'],
  source: ['./lib/**/*.js']
};

if (process.env.CI) {
  plumberConfig.errorHandler = function(err) {
    throw err;
  };
}

module.exports.docs = function (cb) {
  exec('pushd ../togglejs.github.io/ && git reset --hard && git rm --cached -r -f .');
  exec('doxx --template ./views/docsTemplate.jade --source . --ignore node_modules,test,coverage -T ../togglejs.github.io/');
  exec('open ../togglejs.github.io/index.html');
  cb();
};

module.exports.lint = function () {
  return gulp.src(paths.lint)
    .pipe($.jshint('.jshintrc'))
    .pipe($.plumber(plumberConfig))
    .pipe($.jscs())
    .pipe($.jshint.reporter('jshint-stylish'));
};

module.exports.coverage = function (cb) {
  gulp.src(paths.source)
  .pipe($.istanbul()) // Covering files
  .pipe($.istanbul.hookRequire())
  .on('finish', function () {
    gulp.src(paths.tests)
    .pipe($.plumber(plumberConfig))
    .pipe($.mocha({ reporter:'dot' }))
    .pipe($.istanbul.writeReports()) // Creating the reports after tests ran
    .on('finish', function() {
      process.chdir(__dirname);
      cb();
    });
  });
};

module.exports.test = gulp.series(module.exports.lint, module.exports.coverage);

module.exports.watch = gulp.series(module.exports.test, function () {
  gulp.watch(paths.watch, gulp.series(module.exports.test));
});

module.exports.travis = function (cb) {
  opn('https://travis-ci.org/togglejs/toggle');
  cb();
};
module.exports.coveralls = function () {
  opn('https://coveralls.io/r/togglejs/toggle');
  cb();
};

module.exports.default = module.exports.test;
