'use strict';
var path = require('path');
var togError = require('./togErrors');

var PLUGIN_NAME = 'tog-alias';

/**
The `alias` toggle/gulp plugin looks at the vinyl `file` for a `file.togMetadata.alias` url property.
If this property exists, it will generate a new static `html` file that
redirects via an html meta refresh to the original file's new location.

This was written to support redirection as described in the [following blog post](http://staxmanade.com/2014/04/migrating-blogspot-to-octopress-part-6-301-redirect-old-posts-to-new-location/)

# Sample post frontmatter:

```
---
alias: /blog/someDir/12345
---
my blog content here...
```

will generate an HTML redirection page at `/blog/someDir/12345/index.html`.

# `gulpfile.js` usage:

```
var tog = require("toggle");

...
  .pipe(tog.alias())
```

@returns {Function} gulp plugin function that process a file Buffer.
@api public
*/
module.exports = function () {
  var File = require('vinyl');
  var through = require('through2');
  return through.obj(function (file, enc, callback) {

    if (!file.togMetadata) {
      this.emit('error', togError.missingTogMetadata(PLUGIN_NAME));
      return callback();
    }

    if (file.togMetadata.alias) {
      var contents = '<!DOCTYPE html>';
      contents += '<html>\n';
      contents += '<head>\n';
      contents += '<link rel="canonical" href="' + file.togMetadata.url + '"/>\n';
      contents += '<meta http-equiv="content-type" content="text/html; charset=utf-8" />\n';
      contents += '<meta http-equiv="refresh" content="0;url=' + file.togMetadata.url + '" />\n';
      contents += '</head>\n';
      contents += '</html>';

      var newPath = path.join(file.base, file.togMetadata.alias, 'index.html');

      var newFile = new File({
        cwd: file.cwd,
        base: file.base,
        path: newPath,
        contents: new Buffer(contents),
      });
      this.push(newFile);
    }

    this.push(file);
    return callback();
  });
};
