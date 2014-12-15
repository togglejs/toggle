'use strict';
//var PLUGIN_NAME = 'tog-loadHandlebarTheme';

var gulp = require('gulp');
var path = require('path');
var loadHandlebarTemplate = require('./loadHandlebarTemplate');

module.exports = function (theme, Handlebars) {

  var search = path.join(__dirname, '../siteTemplates', theme, '**/*.*');
  var startSearch = path.sep + theme + path.sep;

  return gulp.src(search)
    .pipe(loadHandlebarTemplate(Handlebars, startSearch));
};
