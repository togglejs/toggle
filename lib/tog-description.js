var PLUGIN_NAME = "tog-description";

module.exports = function (replaceTokens) {
    var through = require('through2');
    var striphtml = require('js-striphtml');
    // Creating a stream through which each file will pass

    replaceTokens = replaceTokens || [];

    replaceTokens.push("{{printSeriesIndex}}")

    return through.obj(function (file, enc, callback) {
        if (file.isNull && file.isNull()) {
            // Do nothing if no contents
        }

        var contents;
        var description = '';

        if (file.togMetadata && !file.togMetadata.description) {

            if (file.isBuffer()) {
                contents = file.contents.toString();
            }

            if (file.isStream()) {
                throw new PluginError(PLUGIN_NAME, "Doesn't support streams (yet?)!");
            }

            // if there isn't already a description - let's pull the first 'paragraph' from the contents.
            if (contents) {

                contents = striphtml.stripTags("<h1></h1>" + contents || '', [/* don't allow any tags here */]) || '';
                //console.log('contents 1:', contents);
                replaceTokens.forEach(function (token) {
                    var regex = new RegExp(token, ["g"]);
                    contents = contents.replace(regex, '');
                });
                //console.log('contents 2:', contents);

                var lines = contents
                    .replace(/\r\n/g, "\n")
                    .split("\n")
                    .filter(function (line) {
                        return !!(line || '').trim();
                    })
                    .splice(0, 5);

                //console.log('lines:', lines);
                if (lines.length) {
                    description = (lines[0] || '').substr(0, 150);
                    if (description.length === 150) {
                        description += '...';
                    }
                }
            }

            file.togMetadata.description = description;
        }

        this.push(file);
        return callback();
    });
};