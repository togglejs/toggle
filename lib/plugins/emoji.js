'use strict';
var PLUGIN_NAME = 'tog-gist';

var gemoji = require('gemoji');


/**
The `emoji` toggle/gulp plugin looks at the vinyl `file` contents and will apply token replacement necessary to render github emoji in a post.

# Examples

```
:warning:
```

# `gulpfile.js` usage:

```
var tog = require("toggle");

...
.pipe(tog.emoji())
```

@returns {Function} gulp plugin function that process a file Buffer.
@api public
*/
module.exports = function () {
  var through = require('through2');
  var togError = require('./togErrors');

  // Creating a stream through which each file will pass
  return through.obj(function (file, enc, callback) {

    var contents;

    if (file.isBuffer()) {
      contents = file.contents.toString();
      var token;
      var id;

      var reg = /:([\w+-]+):/g;
      var match = reg.exec(contents);
      while (match !== null) {
        token = match[0];
        id = match[1];

        var emoji = gemoji.name[id];
        if (emoji) {
          console.log(emoji.emoji.toString(16));
          var code = emoji.emoji.charCodeAt(0);
          var codeHex = code.toString(16).toLowerCase();
          //codeHex += ("000" + codeHex).slice(-4);
          console.log(codeHex);
          console.log("id: ", id, " replacement: ", emoji);
          var html = '<img class="emoji" title="' + id + '" alt="' + id + '" src="https://assets.github.com/images/icons/emoji/unicode/' + codeHex + '.png" height="20" width="20" align="absmiddle">';
          contents = contents.split(token).join(html);
        }

        match = reg.exec(contents);
      }
      //
      // reg = /\[gist id=(.*)\]/g;
      // match = reg.exec(contents);
      // while (match !== null) {
      //   gistToken = match[0];
      //   id = match[1];
      //
      //   gistUrl = '<script src="https://gist.github.com/' + id + '.js"></script>';
      //
      //   contents = contents.split(gistToken).join(gistUrl);
      //   match = reg.exec(contents);
      // }

      //file.togMetadata.contents = contents;
      file.contents = new Buffer(contents);
    }

    if (file.isStream()) {
      this.emit('error', togError.noStreamSupport(PLUGIN_NAME));
      return callback();
    }

    this.push(file);
    return callback();
  });
};
