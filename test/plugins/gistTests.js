
/*jshint expr: true*/
'use strict';
require('approvals').configure({
  reporters: ["visualstudio", "opendiff"]
}).mocha(__dirname);

//var expect = require('chai').expect;
var assert = require('stream-assert');
var gutil = require('gulp-util');
var File = gutil.File;

var sut = require("../../lib/plugins/gist");

describe('gist', function () {

  it('Should token replace gists with a file', function (done) {
    var stream = sut();

    var that = this;
    stream
    .pipe(assert.length(1))
    .pipe(assert.nth(0, function (file) {
      that.verify(file.contents.toString());
    }))
    .pipe(assert.end(done));

    var file = new File();
    file.contents = new Buffer("this is some test content with a gist: {{ gist FFFFFFFFFF \"testFile+otherName.js\" }}");

    stream.write(file);
    stream.end();
  });


  it('Should token replace gists with bracket', function (done) {
    var stream = sut();

    var that = this;
    stream
    .pipe(assert.length(1))
    .pipe(assert.nth(0, function (file) {
      that.verify(file.contents.toString());
    }))
    .pipe(assert.end(done));

    var file = new File();
    file.contents = new Buffer("this is some test content with a gist: [gist id=FFFFFFFFFF]");

    stream.write(file);
    stream.end();
  });

});
