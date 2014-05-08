

// renderFunc is a function that takes first parameter templateName : string, context : postObject
// ex: function(templateName, context){ return ...};

module.exports = function (renderFunc) {
    var through = require('through2');
    // Creating a stream through which each file will pass
    return through.obj(function (file, enc, callback) {
        if (file.isNull()) {
            // Do nothing if no contents
        }

        var contents;

        if (file.isBuffer()) {
            contents = file.contents.toString();

            var metadata = file.bulpMetadata;

            if (metadata && metadata.series) {

                metadata.description = "A series of posts about " + metadata.title;

                var seriesPart = renderFunc("series", metadata);
                contents = contents.replace("{%printSeriesIndex%}", seriesPart);
                file.contents = new Buffer(contents);
            }
        }

        if (file.isStream()) {
            throw new PluginError(PLUGIN_NAME, "Doesn't support streams (yet?)!");
        }

        this.push(file);
        return callback();
    });
};