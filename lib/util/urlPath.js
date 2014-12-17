'use strict';

var path = require('path');
var gutil = require('gulp-util');
var joinUrl = require('./joinUrl');

var getBlogOutputname = function (date, filePath, base, blogSlugFormat) {
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

var getPageOutputFileName = function (filePath) {

  // get the folders/filename after the 'root' level.
  var newPath = filePath; //filePath.substr(filePath.indexOf('_pages') + 6);

  newPath = path.normalize(newPath);

  // replace the extension with '.html'
  newPath = newPath.substr(0, newPath.length - path.extname(newPath).length) + '.html';

  //console.log(newPath);
  return newPath;
};

var getPageOutputUrlName = function (url, filePath) {

  // get the folders/filename after the 'root' level.
  var newPath = filePath.substr(filePath.indexOf('_pages') + 6);

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
  getBlogOutputname: getBlogOutputname,
  getPostOutputUrlName: getPostOutputUrlName,
  getPageOutputFileName: getPageOutputFileName,
  getPageOutputUrlName: getPageOutputUrlName
};
