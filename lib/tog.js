'use strict';
var moment = require('moment');
var joinUrl = require('./util/joinUrl');
var togError = require('./plugins/togErrors');
var urlPath = require('./util/urlPath');

// Consts
var PLUGIN_NAME = 'tog-gulp';

var tog = (function() {

  var through = require('through2');

  return function(site) {

    // Creating a stream through which each file will pass
    var stream = through.obj(function (file, enc, callback) {

      var metadata = file.togMetadata;

      if (file.isBuffer()) {

        // TODO: look to remove these 'private setters'
        metadata._date = metadata.date;
        metadata._title = metadata.title;

        // file.contents = new Buffer(matter.body);
        // delete metadata.contents;

        if (metadata.layout === 'post') {
          file.path = urlPath.getBlogOutputName(moment(metadata._date), file.path, file.base, site.blogSlugFormat);
          metadata.url = urlPath.getPostOutputUrlName(site.root_url, file.path);
        } else if (metadata.layout === 'page') {
          file.path = urlPath.getPageOutputFileName(file.path);
          metadata.url = urlPath.getPageOutputUrlName(site.root_url, file.path);
        } else if (metadata.layout === 'default') {
          file.path = urlPath.getPageOutputFileName(file.path);
          metadata.url = urlPath.getPageOutputUrlName(site.root_url, file.path);
        } else if (metadata.layout === 'none') {
          metadata.url = joinUrl(site.root_url, file.path.substr(file.base.length));
        } else {
          console.log(metadata);
          this.emit('error', togError.error(PLUGIN_NAME, 'Unknown layout: ' + metadata.layout));
          return callback();
        }

        //console.log('***************************************************')
        //console.log('BEFORE:', metadata);
        //console.log('BEFORE:', metadata.title);
        metadata = site.addFile(metadata);
        file.togMetadata = metadata;
        //console.log('AFTER:', metadata);
        //console.log('AFTER:', metadata.title);
        //console.log('***************************************************')
      } else {
        this.emit('error', togError.noStreamSupport(PLUGIN_NAME));
        return callback();
      }

      //if (file.path.indexOf('_pages\\index') > 0) {
      //  console.log('******************');
      //  console.log('TESTING: ' + file.path);
      //  console.log(file.contents.toString());
      //  console.log('******************');
      //}

      if (!metadata) {
        console.log('******************');
        console.log('missing metadata?: ', file.history);
        console.log(file);
        console.log('******************');
      }

      site.streamFiles = site.streamFiles || [];
      site.streamFiles.push(file);

      this.push(file);
      return callback();
    });

    // returning the file stream
    return stream;
  };
})();

tog.util = {};
tog.util.joinUrl = joinUrl;
tog.util.wordizeSpecialChars = require('./util/wordizeSpecialChars');

tog.site = require('./App/Site');

// plugins
tog.liquid = require('./plugins/liquid');
tog.templatesHelper = require('./plugins/handlebars');
tog.renderSeries = require('./plugins/renderSeries');
tog.description = require('./plugins/description');
tog.alias = require('./plugins/alias');
tog.loadHandlebarTemplate = require('./plugins/loadHandlebarTemplate');
tog.loadHandlebarTheme = require('./plugins/loadHandlebarTheme');
tog.gist = require('./plugins/gist');
tog.singlePageSeries = require('./plugins/singlePageSeries');

module.exports = tog;
