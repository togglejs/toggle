require('approvals').configure({
    reporters: ["visualstudio", "opendiff"]
}).mocha(__dirname);

var bulp = require("../lib/tog.js");
var fs = require('fs');

describe('Parsing a page', function () {
    it('Page gets parsed', function () {
    });
});

