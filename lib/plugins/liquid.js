'use strict';
module.exports = (function(opts) {

  // through2 is a thin wrapper around node transform streams
  // Consts
  var PLUGIN_NAME = 'tog-liquid';

  // Plugin level function(dealing with files)
  var gulpPrefixer = function () {

    var through   = require('through2');
    var Liquid     = require('liquid-node');
    var liquidEngine = new Liquid.Engine();
    var togError = require('./togErrors');

    opts = opts || {};

    if ( opts.tags && typeof opts.tags === 'object' ) {
      /* Register liquid tags prior to processing */
      Object.keys(opts.tags).forEach(function (tag) {
        Liquid.Template.registerTag(tag, opts.tags[tag]);
      });
    }

    function liquid (file, enc, callback) {
      /*jshint validthis:true */
      var template;
      var promise;

      if (file.isNull()) {
        return callback();
      }

      if (file.isStream()) {
        this.emit('error', togError.noStreamSupport(PLUGIN_NAME));
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
          this.emit('error', togError.error(PLUGIN_NAME, 'Error during conversion: ' + err));
          return callback();
        });
      }
    }

    return through.obj(liquid);
  };

  // Exporting the plugin main function
  return gulpPrefixer;

})();
