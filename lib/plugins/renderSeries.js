'use strict';

var PLUGIN_NAME = 'tog-renderSeries';

// renderFunc is a function that takes first parameter templateName : string, context : postObject
// ex: function(templateName, context){ return ...};

module.exports = function (renderFunc) {
  var through = require('through2');
  var gutil = require('gulp-util');
  var PluginError = gutil.PluginError;
  // Creating a stream through which each file will pass
  return through.obj(function (file, enc, callback) {

    var contents;

    if (file.isBuffer()) {
      contents = file.contents.toString();

      var metadata = file.togMetadata;

      if (metadata && metadata.series) {

        metadata.description = 'A series of posts about ' + metadata.title;

        var seriesPart = renderFunc('series', metadata);
        contents = contents.replace('{%printSeriesIndex%}', seriesPart);
        file.contents = new Buffer(contents);
      }
    }

    if (file.isStream()) {
      throw new PluginError(PLUGIN_NAME, 'Doesn\'t support streams (yet?)!');
    }

    this.push(file);
    return callback();
  });
};
