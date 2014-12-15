'use strict';
module.exports = (function(opts) {

  // through2 is a thin wrapper around node transform streams
  var gutil = require('gulp-util');
  var PluginError = gutil.PluginError;
  // Consts
  var PLUGIN_NAME = 'tog-liquid';

  // Plugin level function(dealing with files)
  var gulpPrefixer = function () {

    var path    = require('path');
    var gutil     = require('gulp-util');
    var through   = require('through2');
    var fs       = require('fs');
    var Liquid     = require('liquid-node');
    var PluginError = gutil.PluginError;
    var liquidEngine = new Liquid.Engine

    opts = opts || {};

    if ( opts.tags && typeof opts.tags == 'object' ) {
      /* Register liquid tags prior to processing */
      Object.keys(opts.tags).forEach(function (tag) {
        Liquid.Template.registerTag(tag, opts.tags[tag]);
      });
    }

    function liquid (file, enc, callback) {
      var template;
      var promise;

      if (file.isNull()) {
        return callback();
      }

      if (file.isStream()) {
        this.emit('error', new PluginError(PLUGIN_NAME, 'Stream content is not supported'));
        return callback();
      }

      if (file.isBuffer()) {
        template = liquidEngine.parse(file.contents.toString());
        promise = template.render(file.togMetadata.options);

        promise.then(function (output) {
          file.contents = new Buffer(output);
          this.push(file);
          callback();
        }.bind(this), function (err) {
          new PluginError('gulp-liquid', 'Error during conversion: ' + err);
        });
      }
    }

    return through.obj(liquid);
  };

  // Exporting the plugin main function
  return gulpPrefixer;

})();
