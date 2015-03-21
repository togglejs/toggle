'use strict';

var wordizeSpecialChars = require('../util/wordizeSpecialChars');
var _ = require('lodash');

module.exports = function (site, opts) {
  if (!site) {
    throw 'first parameter {site} missing (required)';
  }

  var Post = function () { };

  Post.prototype = _.create(site, {
    index: false,
    comments: true,
    titlecase: false,
    page_header: true,
    page_meta: true,
    sharing: true
  });

  Object.defineProperty(Post.prototype, 'isPublished', {
    get: function () {
      // detect explicit 'published===false' - all others are true (even undefined/null)
      return !(this.published === false); //jshint ignore:line
    }
  });

  Post.prototype.isSeries = function () {
    return !!this.seriesId;
  };

  Object.defineProperty(Post.prototype, 'seriesId', {
    get: function () {
      return this._seriesId;
    },
    set: function (value) {
      this._seriesId = (value || '').trim();
    }
  });

  Object.defineProperty(Post.prototype, 'seriesIndex', {
    get: function () {
      if (this.series) {
        return this.series.getPostIndex(this) + 1;
      }
      return null;
    }
  });

  Object.defineProperty(Post.prototype, 'hasCategories', {
    get: function () {
      return this.categories && this.categories.length;
    }
  });

  Object.defineProperty(Post.prototype, 'showComments', {
    get: function () {

      if (this.comments === undefined) {
        return true;
      }
      return !!this.comments;
    }
  });

  Object.defineProperty(Post.prototype, 'categories', {
    get: function () {
      return this._categories || [];
    },
    set: function (values) {
      if (Array.isArray(values)) {

        var slugFormat = this.categoriesSlugFormat;

        if (!slugFormat) {
          throw 'site.categorySlugFormat is not defined';
        }

        this._categories = values.map(function (item) {

          var safeCategoryName = wordizeSpecialChars(item);

          return {
            name: item,
            url: encodeURI(slugFormat.replace('{category}', safeCategoryName)).toLowerCase(),
            file: slugFormat.replace('{category}', safeCategoryName).toLowerCase()
          };
        }.bind(this));
      } else {
        // we can ignore null/undefined - but warn with an error for other objects?
        if (values !== null && values !== undefined) {
          console.error('ERROR: categories value [' + JSON.stringify(values) + '] was not an array. Categories expects an array of values.');
        }
      }
    }
  });

  Object.defineProperty(Post.prototype, 'previous', {
    get: function () {
      var index = (this.posts.indexOf(this));
      ++index;
      var previousPost = this.posts[index];
      return previousPost;
    }
  });

  Object.defineProperty(Post.prototype, 'next', {
    get: function () {
      var index = (this.posts.indexOf(this));
      --index;
      var nextPost = this.posts[index];
      return nextPost;
    }
  });

  Object.defineProperty(Post.prototype, 'title', {
    get: function () {
      if (this.isSeries()) {

        //console.log('seriesList:', this.seriesList);
        //console.log('seriesId:', this.seriesId);

        //console.log((new Error()).stack);
        var series = this.seriesList[this.seriesId];
        if (!series) {
          console.log(this.seriesList);
          throw 'cannot find series object with seriesId[' + this.seriesId + ']';
        }
        return series.getTitle(this);
      }
      return this._title;
    },
    set: function (value) {
      this._title = value;
    }
  });

  return _.create(Post.prototype, opts);
};
