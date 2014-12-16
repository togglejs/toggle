'use strict';
var PLUGIN_NAME = 'tog-gist';

module.exports = function () {
  var through = require('through2');
  var togError = require('./togErrors');

  // Creating a stream through which each file will pass
  return through.obj(function (file, enc, callback) {

    var contents;

    if (file.isBuffer()) {
      contents = file.contents.toString();
      var gistToken;
      var id;
      var fileName;
      var gistUrl;

      var reg = /{{(.?)gist (.*) ("|&quot;)(.*)("|&quot;).?}}/g;
      var match = reg.exec(contents);
      while (match !== null) {
        gistToken = match[0];
        id = match[2];
        fileName = match[4];
        fileName = fileName ? '?file=' + fileName : '';
        gistUrl = '<script src="https://gist.github.com/' + id + '.js' + fileName + '"></script>';

        contents = contents.split(gistToken).join(gistUrl);

        match = reg.exec(contents);
      }

      reg = /\[gist id=(.*)\]/g;
      match = reg.exec(contents);
      while (match !== null) {
        gistToken = match[0];
        id = match[1];

        gistUrl = '<script src="https://gist.github.com/' + id + '.js"></script>';

        contents = contents.split(gistToken).join(gistUrl);
        match = reg.exec(contents);
      }

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
