'use strict';

// Consts
var PLUGIN_NAME = 'tog-singlePageSeries';

module.exports = (function() {

  var makeFilePathFriendly = function (s) {
    return (s || '').replace(/[^a-z0-9]/gi, '-').toLowerCase();
  };

  // through2 is a thin wrapper around node transform streams
  var through = require('through2');
  var path = require('path');
  var File = require('vinyl');
  var gutil = require('gulp-util');
  var PluginError = gutil.PluginError;
  var frontMatter = require('front-matter');
  var yaml = require('js-yaml');
  var _ = require('lodash');
  var moment = require('moment');

  // Plugin level function(dealing with files)
  return function() {

    var cretePageName = function (filePath, seriesAbout, seriesTitle) {
      if (!seriesTitle) {
        throw new PluginError(PLUGIN_NAME, 'Page in series [' + seriesAbout + '] is missing \'seriesTitle\' yaml front matter.');
      }

      function pad(n) {
        return n < 10 ? '0' + n : n;
      }

      var date = moment();

      var slugTokenYear = String(date.year());
      var slugTokenMonth = String(pad(date.month() + 1));
      var slugTokenDay = String(pad(date.day()));

      var fileNameTitle = makeFilePathFriendly(seriesTitle);
      return slugTokenYear + '-' + slugTokenMonth + '-' + slugTokenDay + '-' + seriesAbout + '-' + fileNameTitle;
    };

    // Creating a stream through which each file will pass
    var stream = through.obj(function (file, enc, callback) {

      if (file.isBuffer()) {

        var fileContents = file.contents.toString('utf-8');
        var matter = frontMatter(fileContents);
        var parentMetadata = matter.attributes;

        // if it's tagged with a singlePageSeries flag
        if (parentMetadata.singlePageSeries) {

          // remove delimeter so it doesn't get split at the delimeter declaration
          fileContents = fileContents.replace(/seriesDelimeter:(.*)/g, '');

          var pages = fileContents.split(matter.attributes.seriesDelimeter);

          pages.forEach(function (pageContents) {

            var matter = frontMatter(pageContents);

            var metadata = matter.attributes;

            // inherit properties from the head series yaml frontmatter
            metadata = _.extend(parentMetadata, metadata);

            var newMatter = '---\n' + yaml.safeDump(metadata) + '---\n\n';
            pageContents = newMatter + matter.body;

            var postFileName = cretePageName(file.path, makeFilePathFriendly(metadata.seriesAbout), metadata.seriesTitle);

            var newPath = path.join(file.base, postFileName + '.markdown');

            var newFile = new File({
              cwd: file.cwd,
              base: file.base,
              path: newPath,
              contents: new Buffer(pageContents),
            });
            this.push(newFile);

          }.bind(this));
        } else {
          this.push(file);
        }
      }

      if (file.isStream()) {
        throw new PluginError(PLUGIN_NAME, 'Doesn\'t support streams!');
      }

      return callback();
    });

    // returning the file stream
    return stream;
  };
})();
