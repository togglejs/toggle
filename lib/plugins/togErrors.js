'use strict';
var PluginError = require('gulp-util').PluginError;

module.exports = (function () {

  return {
    missingTogMetadata: function (pluginName) {
      return new PluginError(pluginName, 'The file passed is missing the expected "togMetadata" property');
    },
    noStreamSupport: function (pluginName) {
      return new PluginError(pluginName, 'This plugin does not support streams');
    },
    error: function (pluginName, msg) {
      return new PluginError(pluginName, msg);
    }
  };
})();
