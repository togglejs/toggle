'use strict';

var gulp = require('gulp');
var gulp   = require('gulp');
var $ = require('gulp-load-plugins')();
var shelljs = require('shelljs');
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

gulp.task('default', ['test']);

gulp.task('docs', function () {
  exec('pushd ../togglejs.github.io/ && git reset --hard && git rm --cached -r -f .');
  exec('doxx --template ./views/docsTemplate.jade --source . --ignore node_modules,test,coverage -T ../togglejs.github.io/');
  exec('open ../togglejs.github.io/index.html');
});

gulp.task('lint', function () {
  return gulp.src(paths.lint)
    .pipe($.jshint('.jshintrc'))
    .pipe($.plumber(plumberConfig))
    .pipe($.jscs())
    .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('coverage', function (cb) {
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
});

gulp.task('watch', ['test'], function () {
  gulp.watch(paths.watch, ['test']);
});

gulp.task('test', ['lint', 'coverage']);

gulp.task('default', ['test']);
