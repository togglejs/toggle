// Consts
var PLUGIN_NAME = 'tog-loadHandlebarTemplate';

var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var path = require('path');

module.exports = function (Handlebars, startSearch) {

    if (!Handlebars) {
        throw "First argument must be an instance of Handlebars";
    }

    if (!startSearch) {
        throw "Second argument must be a string that is where we will chop the file path to begin a template name. EX: Given this value 'templates' then the path C:\foo\bar\templates\head.html -> translates to a template name 'head'";
    }

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

        var index = file.path.indexOf(startSearch);

        // var trim the front part of the path off
        // EX: togglejs/lib/siteTemplates/octoport/head.html -> head.html
        templateName = templateName.substr(index + startSearch.length);

        // var trim the extension off 
        // EX: head.html -> head
        templateName = templateName.substr(0, templateName.length - path.extname(templateName).length);

        // normalize the slashes to forwardslash
        templateName = templateName.replace(/\\/g, "/");

        // remove the leading slash.
        if (templateName[0] === '/') {
            templateName = templateName.substr(1);
        }

        //console.log("templateName: ", templateName);

        Handlebars.templates = Handlebars.templates || {};
        Handlebars.templates[templateName] = Handlebars.compile(contents);

        this.push(file);
        return callback();
    });
};