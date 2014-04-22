var yaml = require( 'js-yaml' );
var path = require('path');
var _ = require('lodash');

var getPage = function ( contents ) {
    var endOfYaml;

    var result = {
        options: {},
        contents: contents,
        raw: contents
    };

    var parts = contents.split('---')
     if (parts.length >= 3) {
        result.options = yaml.load(parts[1]);
        result.contents = parts.slice(2).join('---').replace(/^\s+/,'');
    }

    return result;
}

var getBlogOutputname = function (date, filePath, blogSlugFormat) {
    var baseName = path.basename(filePath);
    var blogFolderName = baseName.substr(0, baseName.length - path.extname(baseName).length).substr(11);

    function pad(n){return n<10 ? '0'+n : n}

    var slugTokenYear = "" + date.getUTCFullYear();
    var slugTokenMonth = "" + pad(date.getUTCMonth());
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

module.exports = (function(opts) {

    // default options.
    opts = _.extend(opts, {
        blogSlugFormat: "/:year/:month/:title/"
    });


    // through2 is a thin wrapper around node transform streams
    var through = require('through2');
    var gutil = require('gulp-util');
    var PluginError = gutil.PluginError;

    // Consts
    var PLUGIN_NAME = 'bulp-gulp';

    // Plugin level function(dealing with files)
    function gulpPlugin() {

        // Creating a stream through which each file will pass
        var stream = through.obj(function (file, enc, callback) {
            if (file.isNull()) {
                // Do nothing if no contents
            }

            var metadata;

            if (file.isBuffer()) {
                metadata = getPage(file.contents.toString('utf-8'));

                file.contents = new Buffer(metadata.contents);
            }

            if (file.isStream()) {
                throw new PluginError(PLUGIN_NAME, "Doesn't support streams (yet?)!");
            }

            if(metadata.options.layout === "post") {
                file.path = getBlogOutputname(metadata.options.date, file.path, opts.blogSlugFormat);
            }

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

module.exports.getPage = getPage;