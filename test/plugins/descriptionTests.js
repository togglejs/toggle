/*jshint expr: true*/
'use strict';
require('approvals').configure({
  reporters: ["visualstudio", "opendiff"]
}).mocha(__dirname);

var expect = require('chai').expect;
var assert = require('stream-assert');
var gutil = require('gulp-util');
var File = gutil.File;

var sut = require("../../lib/plugins/description");

describe('description', function () {

  it('Should remove html from the description', function (done) {
    var stream = sut();

    stream
    .pipe(assert.length(1))
    .pipe(assert.nth(0, function (file) {
      expect(file.togMetadata).to.be.ok;
      expect(file.togMetadata.description).to.equal("this is some test content");
    }))
    .pipe(assert.end(done));

    var file = new File();
    file.togMetadata = {};
    file.contents = new Buffer("<h1>this is some test content</h1>\r\n\r\n <b>with a some bold text</b>");

    stream.write(file);
    stream.end();
  });

});
