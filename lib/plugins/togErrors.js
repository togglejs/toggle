'use strict';
var PluginError = require('gulp-util').PluginError;


module.exports = (function () {

  return {
    missingTogMetadata: function (pluginName) {
      return new PluginError(pluginName, 'The file passed is missing the expected "togMetadata" property');
    }
  };
})();
