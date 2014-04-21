require('approvals').configure({
    reporters: ["visualstudio", "opendiff"]
}).mocha(__dirname);

var bulp = require("../lib/bulp.js");
var fs = require('fs');

describe('Parsing a page', function () {
    it('Page gets parsed', function () {
        var filePath = 'tests/samplePosts/2014-20-01-this-is-my-title.md';

        var contents = fs.readFileSync(filePath, 'utf-8');

        var metadata = bulp.getPage(contents);

        this.verifyAsJSON(metadata);
    });
});

