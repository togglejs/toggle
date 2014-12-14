var PLUGIN_NAME = "tog-gist";

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

            var reg = /{{(.?)gist (.*) ("|&quot;)(.*)("|&quot;).?}}/g;
            var match = reg.exec(contents);
            while (match !== null) {
                var gistToken = match[0];
                var id = match[2];
                var fileName = match[4];
                fileName = fileName ? '?file=' + fileName : '';
                var gistUrl = '<script src="https://gist.github.com/' + id + '.js' + fileName + '"></script>';

                contents = contents.split(gistToken).join(gistUrl);

                match = reg.exec(contents);
            }

            //file.togMetadata.contents = contents;
            file.contents = new Buffer(contents);
        }

        if (file.isStream()) {
            throw new PluginError(PLUGIN_NAME, "Doesn't support streams (yet?)!");
        }

        this.push(file);
        return callback();
    });
};
