'use strict';
var path = require('path');

module.exports = function () {
    var File = require('vinyl');
    var through = require('through2');
    return through.obj(function (file, enc, callback) {

        if (file.togMetadata.alias) {
            var contents = '<!DOCTYPE html>';
            contents += '<html>\n';
            contents += '<head>\n';
            contents += '<link rel="canonical" href="' + file.togMetadata.url + '"/>\n';
            contents += '<meta http-equiv="content-type" content="text/html; charset=utf-8" />\n';
            contents += '<meta http-equiv="refresh" content="0;url=' + file.togMetadata.url + '" />\n';
            contents += '</head>\n';
            contents += '</html>';

            var newPath = path.join(file.base, file.togMetadata.alias, "index.html");

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
