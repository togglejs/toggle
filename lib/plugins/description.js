'use strict';
var PLUGIN_NAME = 'tog-description';


/**
The `description` toggle/gulp plugin can be used to generate the description used in an RSS feed.

It looks at the vinyl `file` and
if the `file.togMetadata.description` property is missing, will take
the contents, strip any html, and set the `file.togMetadata.description`
to the first 150 characters of the file contents.

If the contents are longer than 150 characters it trims after that
point and appends an ellipsis `...` to the end.

# `gulpfile.js` usage:

```
var tog = require("toggle");

...
.pipe(tog.description())
```

@returns {Function} gulp plugin function that process a file Buffer.
@api public
*/

module.exports = function (replaceTokens) {
  var through = require('through2');
  var striphtml = require('js-striphtml');
  var togError = require('./togErrors');

  replaceTokens = replaceTokens || [];

  replaceTokens.push('{{printSeriesIndex}}');

  return through.obj(function (file, enc, callback) {

    var contents;
    var description = '';

    if (file.togMetadata && !file.togMetadata.description) {

      if (file.isBuffer()) {
        contents = file.contents.toString();
      }

      if (file.isStream()) {
        this.emit('error', togError.noStreamSupport(PLUGIN_NAME));
        return callback();
      }

      // if there isn't already a description - let's pull the first 'paragraph' from the contents.
      if (contents) {

        contents = striphtml.stripTags('<h1></h1>' + contents || '', [/* don't allow any tags here */]) || '';
        //console.log('contents 1:', contents);
        replaceTokens.forEach(function (token) {
          var regex = new RegExp(token, ['g']);
          contents = contents.replace(regex, '');
        });
        //console.log('contents 2:', contents);

        var lines = contents
          .replace(/\r\n/g, '\n')
          .split('\n')
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
