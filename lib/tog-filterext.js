module.exports = function (filter) {

    if (!filter && !(typeof filter === "function")) {
        throw "expecting first argument to be a function that accepts one argument (extension) and returns a Boolean.";
    }

    var path = require('path');
    var through = require('through2');
    return through.obj(function (file, enc, callback) {

        var ext = (path.extname(file.originalPath) || '').toLowerCase();
        if (filter(ext)) {
            this.push(file);
        }
        return callback();
    });
};