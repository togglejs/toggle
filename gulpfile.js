'use strict';

var gulp = require('gulp');
var gulp   = require('gulp');
var $ = require('gulp-load-plugins')();
var exec = require('shelljs').exec;

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
  exec('doxx --source lib && open docs/index.html');
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
