require('approvals').configure({
    reporters: ["visualstudio", "opendiff"]
}).mocha(__dirname);

var bulp = require("../lib/bulp.js");

describe('Parsing a page', function () {
    it('Page gets parsed', function () {
        var filePath = 'tests/samplePosts/2014-20-01.md';

        var metadata = bulp.getPage(filePath);

        this.verifyAsJSON(metadata);
    });
});

