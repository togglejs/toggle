var yaml = require( 'js-yaml' );


var getPage = function ( contents ) {
    var endOfYaml;

    var result = {
        options: {},
        contents: contents,
        raw: contents
    };

    if ( contents[0] === "-" && contents[1] === "-" && contents[2] === "-" ) {
        contents = contents.substr( 3 );
        endOfYaml = contents.indexOf( '\n---\n' );
        var crlfNewLines = false;
        if ( endOfYaml < 0 ) {
            endOfYaml = contents.indexOf( '\r\n---\r\n' );
            crlfNewLines = true;
        }
        if ( endOfYaml >= 0 ) {
            var yamlString = contents.substr( 0, endOfYaml );

            yaml.safeLoadAll( yamlString, function ( doc ) {
                result.options = doc;
            });

            result.contents = contents.substr( endOfYaml + ( crlfNewLines ? 9 : 5 ) );
        }
    }

    return result;
}

var path = require('path');
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
    opts = opts || {
        blogSlugFormat: "/:year/:month/:title/"
    };


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