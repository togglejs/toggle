'use strict';

var path = require('path');
var gutil = require('gulp-util');
var joinUrl = require('./joinUrl');

/**
*
* Generates a path that conforms to a blogSlugFormat, replacing :year, :month,
* :day, :title values within a template
*
* EX: blogSlugFormat = '/:year/:month/:title/'
*
* @param {MomentJsDate} date a `momentjs` date object
* @param {String} filePath  the original file path
* @param {String} base the root directory structure to prepend to the blogSlugFormat
* @param {String} blogSlugFormat template that can have `:year`, `:month`, `:day`, and `:title` within the slug to generate a pretty URL format.
* @returns {String} string with the pretty url `/`
*/
var getBlogOutputName = function (date, filePath, base, blogSlugFormat) {
  var baseName = path.basename(filePath);

  var slugTitle = baseName.substr(0, baseName.length - path.extname(baseName).length).substr(11);

  function pad(n) {
    return n < 10 ? '0' + n : n;
  }

  var slugTokenYear = String(date.year());
  var slugTokenMonth = String(pad(date.month() + 1));
  var slugTokenDay = String(pad(date.day()));
  var slugTokenTitle = String(slugTitle);

  var newFileName = blogSlugFormat
    .replace(':year', slugTokenYear)
    .replace(':month', slugTokenMonth)
    .replace(':day', slugTokenDay)
    .replace(':title', slugTokenTitle);

  newFileName = path.join(newFileName, 'index.html');
  var result = path.normalize(base + '/' + newFileName);

  return result;
};

/**
*
* Used by toggle to generate the `file.togMetadata.url` property combining the site's base url with the filePath of the file.
* This also removes any `index.html` from the end.
*
* @param {String} url
* @returns {String} filePath
*/

var getPostOutputUrlName = function (url, filePath) {
  // get the folders/filename after the 'root' level.
  var newPath = filePath.substr(filePath.indexOf('_posts') + 6);

  newPath = path.normalize(newPath);

  // replace the extension with '.html'
  newPath = gutil.replaceExtension(newPath, '.html');

  // combine the paths
  newPath = joinUrl(url, newPath);

  // remove 'index.html' from the end
  var whatToTrim = 'index.html';
  if (newPath.length > whatToTrim.length) {
    if (newPath.substr(newPath.length - whatToTrim.length).toLowerCase() === whatToTrim.toLowerCase()) {
      newPath = newPath.substr(0, newPath.length - whatToTrim.length);
    }
  }
  //console.log(newPath);

  return newPath;
};

/**
*
* Applies some normailzations to the filePath parameter.
*
* - `path.normalize`'s the file
* - replaces the extension with `.html` - ex: our `file.md` would become `file.html`
*
* @param {String} filePath  the original file path
* @returns {String} string with the normaizations applied
*/
var getPageOutputFileName = function (filePath) {

  // get the folders/filename after the 'root' level.
  var newPath = filePath; //filePath.substr(filePath.indexOf('_pages') + 6);

  newPath = path.normalize(newPath);

  // replace the extension with '.html'
  newPath = newPath.substr(0, newPath.length - path.extname(newPath).length) + '.html';

  //console.log(newPath);
  return newPath;
};

/**
*
* Used by toggle to generate the `file.togMetadata.url` property combining the site's base url with the filePath of the file.
* This also removes any `index.html` from the end.
*
* @param {String} url
* @returns {String} filePath
*/
var getPageOutputUrlName = function (url, filePath) {

  // get the folders/filename after the 'root' level.
  var newPath = filePath.substr(filePath.indexOf('_pages') + 6);

  // TODO: refactor - looks like this applies what getPageOutputFileName does already...

  newPath = path.normalize(newPath);

  // replace the extension with '.html'
  newPath = newPath.substr(0, newPath.length - path.extname(newPath).length) + '.html';

  // combine the paths
  newPath = joinUrl(url, newPath);

  // remove 'index.html' from the end
  var whatToTrim = '/index.html';
  if (newPath.length > whatToTrim.length) {
    if (newPath.substr(newPath.length - whatToTrim.length).toLowerCase() === whatToTrim.toLowerCase()) {
      newPath = newPath.substr(0, newPath.length - whatToTrim.length);
    }
  }

  return newPath;
};

module.exports = {
  getBlogOutputName: getBlogOutputName,
  getPostOutputUrlName: getPostOutputUrlName,
  getPageOutputFileName: getPageOutputFileName,
  getPageOutputUrlName: getPageOutputUrlName
};
