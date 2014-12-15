/*jshint expr: true*/
'use strict';
require('approvals').configure({
  reporters: ["visualstudio", "opendiff"]
}).mocha(__dirname);

var expect = require('chai').expect;
var assert = require('stream-assert');
var gutil = require('gulp-util');
var File = gutil.File;

var sut = require("../../lib/plugins/alias");

describe('alias', function () {

  it('should raise issue with invalid file.togMetadata property', function (done) {
    var stream = sut();
    var err;
    var finish = function () {
      expect(err).to.be.ok;
      expect(err.plugin).to.equal('tog-alias');
      expect(err.message).to.equal('The file passed is missing the expected "togMetadata" property');
      done();
    };

    stream
      .pipe(assert.length(0))
      .pipe(assert.end(finish));

    stream.on('error', function (error) {
      err = error;
    });

    stream.write(new File());

    stream.end();
  });


  it('Should ignore files that do not have alias: true value', function (done) {
    var stream = sut();

    stream
      .pipe(assert.length(1))
      .pipe(assert.end(done));

    var file = new File();
    file.togMetadata = {};
    stream.write(file);
    stream.end();
  });


  it('Should generate a redirect page when alias: true', function (done) {
    var stream = sut();

    var that = this;
    stream
    .pipe(assert.length(2))
    .pipe(assert.nth(0, function (file) {
      expect(file.path).to.match(/\/blog\/6859491611526547041\/index\.html$/);
      that.verify(file.contents.toString());
    }))
    .pipe(assert.end(done));

    var file = new File();
    file.togMetadata = {
      alias: '/blog/6859491611526547041',
      url: '/test',
    };
    stream.write(file);
    stream.end();
  });

});
