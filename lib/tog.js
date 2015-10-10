'use strict';
var moment = require('moment');
var joinUrl = require('./util/joinUrl');
var togError = require('./plugins/togErrors');
var urlPath = require('./util/urlPath');


// Consts
var PLUGIN_NAME = 'tog-gulp';


/**
The `tog` toggle/gulp plugin looks at the vinyl `file` for a `file.togMetadata.alias` url property.
If this property exists, it will generate a new static `html` file that
redirects via an html meta refresh to the original file's new location.

# Requires:

Vinyl `file.togMetadata` object which contains the yaml frontmatter

# `gulpfile.js` usage:

```
var tog = require("toggle");
var paths = {
  source_pages: "./site/_pages/*.*",
  source_posts: "./site/_posts/*.*"
};

gulp.task('build-inMemory', function () {
  site = require('./site.js');

  return gulp.src([paths.source_posts, paths.source_pages])
    .pipe($.frontMatter({
      property: 'togMetadata',
      remove: true              // remove the yaml front matter
    }))
    .pipe(tog(site))
    .pipe(tog.description());

});
```

@returns {Function} gulp plugin function that process a file Buffer.
@api public
*/
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

          var rawDate = metadata._date;
          moment.createFromInputFallback = function(config) {
            // unreliable string magic, or
             throw new Error('Blog post date invalid: \n - date=[' + rawDate + ']\n - file path: ' + file.path);
          };

          file.path = urlPath.getBlogOutputName(moment(rawDate), file.path, file.base, site.blogSlugFormat);
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
tog.emoji = require('./plugins/emoji');
tog.singlePageSeries = require('./plugins/singlePageSeries');

module.exports = tog;
