// Consts
var PLUGIN_NAME = 'bulp-loadHandlebarTemplate';

// through2 is a thin wrapper around node transform streams
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var path = require('path');

module.exports = function (Handlebars) {
    return through.obj(function (file, enc, callback) {
        if (file.isNull()) {
            // Do nothing if no contents
        }

        var contents = "";

        if (file.isBuffer()) {
            contents = file.contents.toString();
        }

        if (file.isStream()) {
            throw new PluginError(PLUGIN_NAME, "Doesn't support streams (yet?)!");
        }

        var templateName = file.path;

        // remove the file extension
        templateName = templateName.substr(0, templateName.length - path.extname(templateName).length);

        // trim everything in the path before "_includes/"
        templateName = templateName.substr(templateName.indexOf('_includes') + 10);
        
        // normalize the slashes to forwardslash
        templateName = templateName.replace(/\\/g, "/");
        
        //console.log("templateName: ", templateName);

        Handlebars.templates = Handlebars.templates || {};
        Handlebars.templates[templateName] = Handlebars.compile(contents);

        this.push(file);
        return callback();
    });
};