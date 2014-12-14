var yaml = require( 'js-yaml' );
var path = require('path');
var _ = require('lodash');
var moment = require('moment');
var joinUrl = require('./joinUrl');
var gutil = require('gulp-util');

var getBlogOutputname = function (date, filePath, base, blogSlugFormat) {
    var baseName = path.basename(filePath);

    var slugTitle = baseName.substr(0, baseName.length - path.extname(baseName).length).substr(11);

    function pad(n) {
      return n < 10 ? '0' + n : n;
    }

    var slugTokenYear = "" + date.year();
    var slugTokenMonth = "" + pad(date.month()+1);
    var slugTokenDay = "" + pad(date.day());
    var slugTokenTitle = "" + slugTitle;

    var newFileName = blogSlugFormat
        .replace(":year", slugTokenYear)
        .replace(":month", slugTokenMonth)
        .replace(":day", slugTokenDay)
        .replace(":title", slugTokenTitle);

    newFileName = path.join(newFileName, "index.html");
    var result = path.normalize(base + "/" + newFileName);

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
    var whatToTrim = "index.html";
    if (newPath.length > whatToTrim.length) {
        if (newPath.substr(newPath.length - whatToTrim.length).toLowerCase() == whatToTrim.toLowerCase()) {
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
    newPath = newPath.substr(0, newPath.length - path.extname(newPath).length) + ".html";

    //console.log(newPath);
    return newPath;
};

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
};



var tog = (function() {


    // through2 is a thin wrapper around node transform streams
    var through = require('through2');
    var gutil = require('gulp-util');
    var frontMatter = require('front-matter');
    var PluginError = gutil.PluginError;

    // Consts
    var PLUGIN_NAME = 'tog-gulp';

    // Plugin level function(dealing with files)
    return function(site) {

        //site.blogSlugFormat = site.blogSlugFormat || "/:year/:month/:title/"

        // Creating a stream through which each file will pass
        var stream = through.obj(function (file, enc, callback) {
            if (file.isNull()) {
                // Do nothing if no contents
            }

            file.originalPath = file.path;

            var metadata;

            if (file.isBuffer()) {


                var matter = frontMatter(file.contents.toString('utf-8'));
                metadata = matter.attributes;

                // TODO: look to remove these 'private setters'
                metadata._date = metadata.date;
                metadata._title = metadata.title;

                file.contents = new Buffer(matter.body);
                delete metadata.contents;

                if (metadata.layout === "post") {
                    file.path = getBlogOutputname(moment(metadata._date), file.path, file.base, site.blogSlugFormat);
                    metadata.url = getPostOutputUrlName(site.root_url, file.path);
                } else if (metadata.layout === "page") {
                    file.path = getPageOutputFileName(file.path);
                    metadata.url = getPageOutputUrlName(site.root_url, file.path);
                } else if (metadata.layout === "default") {
                    file.path = getPageOutputFileName(file.path);
                    metadata.url = getPageOutputUrlName(site.root_url, file.path);
                } else if (metadata.layout === "none") {
                    metadata.url = joinUrl(site.root_url, file.path.substr(file.base.length));
                } else {
                  console.log(metadata);
                    console.error("Unknown layout: " + metadata.layout);
                }

                //console.log("***************************************************")
                //console.log("BEFORE:", metadata);
                //console.log("BEFORE:", metadata.title);
                metadata = site.addFile(metadata);
                //console.log("AFTER:", metadata);
                //console.log("AFTER:", metadata.title);
                //console.log("***************************************************")
            } else {
                console.log("***************************************************");
                console.log("***** Not sure this is being handled right");
                console.log("***** only know how to deal with buffers...");
                console.log(file.path);
                console.log(file);
                console.log("***************************************************");
            }

            //if (file.path.indexOf("_pages\\index") > 0) {
            //    console.log("******************");
            //    console.log("TESTING: " + file.path);
            //    console.log(file.contents.toString());
            //    console.log("******************");
            //}

            if (file.isStream()) {
                throw new PluginError(PLUGIN_NAME, "Doesn't support streams (yet?)!");
            }

            if (!metadata) {
                console.log("******************");
                console.log("missing metadata?: " + file.originalPath);
                console.log(file);
                console.log("******************");
            }

            file.togMetadata = metadata;

            site.streamFiles = site.streamFiles || [];
            site.streamFiles.push(file);

            this.push(file);
            return callback();
        });

        // returning the file stream
        return stream;
    };
})();

tog.joinUrl = joinUrl;
tog.liquid = require('./tog-liquid');
tog.templatesHelper = require('./tog-handlebars');
tog.renderSeries = require('./tog-renderSeries');
tog.description = require('./tog-description');
tog.site = require('./App/Site');
tog.alias = require('./plugins/alias');
tog.filterext = require('./tog-filterext');
tog.wordizeSpecialChars = require('./wordizeSpecialChars');
tog.loadHandlebarTemplate = require('./tog-loadHandlebarTemplate');
tog.loadHandlebarTheme = require('./tog-loadHandlebarTheme');
tog.gist = require('./tog-gist');
tog.singlePageSeries = require('./tog-singlePageSeries');
module.exports = tog;
