var yaml = require( 'js-yaml' );
var path = require('path');
var _ = require('lodash');
var moment = require('moment');
var joinUrl = require('./joinUrl');

var splitYamlFromContent = function (contents) {
    var endOfYaml;

    var result = {
        contents: contents,
        rawContents: contents
    };

    var parts = contents.split('---')

    if (parts.length >= 3) {
        result = yaml.load(parts[1]);
        result.rawContents = contents;
        result.contents = parts.slice(2).join('---').replace(/^\s+/, '');
    }

    return result;
}

var getBlogOutputname = function (date, filePath, blogSlugFormat) {
    var baseName = path.basename(filePath);

    // TODO: this is not generic enought - what if they change the folder from "_includes" to "files"
    var blogFolderName = baseName.substr(0, baseName.length - path.extname(baseName).length).substr(11);

    function pad(n){return n<10 ? '0'+n : n}

    if(typeof date === "string") {
        date = new Date(date);
    }

    var slugTokenYear = "" + date.getUTCFullYear();
    var slugTokenMonth = "" + pad(date.getUTCMonth() + 1);
    var slugTokenDay = "" + pad(date.getUTCDay());
    var slugTokenTitle = "" + blogFolderName;

    var newFileName = blogSlugFormat
        .replace(":year", slugTokenYear)
        .replace(":month", slugTokenMonth)
        .replace(":day", slugTokenDay)
        .replace(":title", slugTokenTitle);

    newFileName = path.join(newFileName, "index.html");
    return path.normalize(path.dirname(filePath) + "/" + newFileName);
}

var getPostOutputUrlName = function (url, filePath) {

    // get the folders/filename after the 'root' level.
    var newPath = filePath.substr(filePath.indexOf('_posts') + 6);

    newPath = path.normalize(newPath);

    // replace the extension with '.html'
    newPath = newPath.substr(0, newPath.length - path.extname(newPath).length) + ".html";

    // combine the paths
    newPath = joinUrl(url, newPath);

    // remove 'index.html' from the end
    var whatToTrim = "/index.html";
    if (newPath.length > whatToTrim.length) {
        if (newPath.substr(newPath.length - whatToTrim.length).toLowerCase() == whatToTrim.toLowerCase()) {
            newPath = newPath.substr(0, newPath.length - whatToTrim.length);
        }
    }
    //console.log(newPath);

    return newPath;
}

var getPageOutputFileName = function (filePath) {

    // get the folders/filename after the 'root' level.
    var newPath = filePath; //filePath.substr(filePath.indexOf('_pages') + 6);

    newPath = path.normalize(newPath);

    // replace the extension with '.html'
    newPath = newPath.substr(0, newPath.length - path.extname(newPath).length) + ".html";

    //console.log(newPath);
    return newPath;
}

var getPageOutputUrlName = function (url, filePath) {

    // get the folders/filename after the 'root' level.
    var newPath = filePath.substr(filePath.indexOf('_pages') + 6);

    newPath = path.normalize(newPath);

    // replace the extension with '.html'
    newPath = newPath.substr(0, newPath.length - path.extname(newPath).length) + ".html";

    // combine the paths
    newPath = joinUrl(url, newPath);

    // remove 'index.html' from the end
    var whatToTrim = "/index.html";
    if (newPath.length > whatToTrim.length) {
        if (newPath.substr(newPath.length - whatToTrim.length).toLowerCase() == whatToTrim.toLowerCase()) {
            newPath = newPath.substr(0, newPath.length - whatToTrim.length);
        }
    }

    return newPath;
}



var bulp = (function() {


    // through2 is a thin wrapper around node transform streams
    var through = require('through2');
    var gutil = require('gulp-util');
    var PluginError = gutil.PluginError;

    // Consts
    var PLUGIN_NAME = 'bulp-gulp';

    // Plugin level function(dealing with files)
    function gulpPlugin(site) {

        site.blogSlugFormat = site.blogSlugFormat || "/:year/:month/:title/"

        // Creating a stream through which each file will pass
        var stream = through.obj(function (file, enc, callback) {
            if (file.isNull()) {
                // Do nothing if no contents
            }

            var metadata;

            if (file.isBuffer()) {
                metadata = splitYamlFromContent(file.contents.toString('utf-8'));

                metadata.date = moment(metadata.date).toDate();
                metadata.titleText = metadata.title;
                file.contents = new Buffer(metadata.contents);


                if (metadata.layout === "post") {
                    file.path = getBlogOutputname(metadata.date, file.path, site.blogSlugFormat);
                    metadata.url = getPostOutputUrlName(site.root_url, file.path);
                } else if (metadata.layout === "page") {
                    file.path = getPageOutputFileName(file.path);
                    metadata.url = getPageOutputUrlName(site.root_url, file.path);
                } else if (metadata.layout === "default") {
                    file.path = getPageOutputFileName(file.path);
                    metadata.url = getPageOutputUrlName(site.root_url, file.path);
                } else {
                    console.error("Unknown layout: " + metadata.layout);
                }

                site.addFile(metadata);
            }

            if (file.isStream()) {
                throw new PluginError(PLUGIN_NAME, "Doesn't support streams (yet?)!");
            }

            //console.log(file.path)

            file.bulpMetadata = metadata;

            this.push(file);
            return callback();
        });

        // returning the file stream
        return stream;
    };

    // Exporting the plugin main function
    return gulpPlugin;
})();

bulp.splitYamlFromContent = splitYamlFromContent;
bulp.liquid = require('./bulp-liquid');
bulp.loadHandlebarTemplate = require('./bulp-loadHandlebarTemplate');
bulp.joinUrl = joinUrl;
module.exports = bulp;
