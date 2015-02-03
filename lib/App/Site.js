'use strict';
var _ = require('lodash');
var uuid = require('node-uuid');
var joinUrl = require('../util/joinUrl');
var moment = require('moment');

var Post = require('./Post');
var Page = require('./Page');
var Series = require('./Series');
var Paginator = require('./Paginator');

module.exports = function (opts) {

  var postId = 0;

  var defaults = {
    siteTitle: '<TODO: place the name of your site here>',
    blogSlugFormat: '/:year/:month/:title/',
    categoriesSlugFormat: '/blog/categories/{category}/',
    root_url: 'http://example.com',
    author: {
      name: '(TODO put your name ex: Bugs Bunny)',
      email: '', //optional email
      link: '', // optional
    },
    year: new Date().getFullYear().toString(),
    titlecase: false,
    assets: '',
    page_meta: true,

    showUnPublished: false,

    pagination: {
      size: 10,
    },

    subscribe_email: '',

    simple_search: 'https://www.google.com/search',

    sidebar_collapse: false, // TODO: test this.
    sidebar: true,

    recentPostsConfig: {
      show: true,
      showCount: 7
    },

    archives: {
      link: '/blog/archives/',
      label: 'Archives'
    },

    github: {
      username: '',
      repoCount: 5,
      skipForks: true,
      showProfileLink: false,
    },

    twitter: {
      username: '',
      widgetId: '',
      tweetButton: false,
      followButton: false,
    },

    facebook: {
      likeButton: false,
      appId: '',
    },

    google: {
      username: '',
      plusOneButton: false,
      plusOneSize: 'medium',

      analyticsTrackingId: '',
    },

    disqus: {
      show: true,
      shortName: '',
    },

    pages: [],
    seriesList: {}
  };

  var Site = function () {
    this.siteId = uuid.v4();
    this._posts = [];
  };
  Site.prototype = _.merge(defaults, opts);

  Site.prototype.addFile = function (post) {
    ++postId;

    // TODO:
    // guard against someone calling this with duplicate files (from gulp selector selectors)...
    // (I did it while building this and cauzed some crazy bugs).

    if (post.layout === 'none') {
      return _.create(site, post);
    }

    if (post.layout === 'page' || post.layout === 'default') {
      post = new Page(this, post);
      this.pages.push(post);
    } else {
      post = new Post(this, post);
      this.addPost(post);
    }

    post.___postId = postId;

    if (post.isSeries && post.isSeries()) {

      var series = this.seriesList[post.seriesId];
      if (!series) {
        series = new Series(post.seriesAbout);
        this.seriesList[post.seriesId] = series;
      }

      series.about = series.about || post.seriesAbout;
      post.series = series;

      if (series.posts.filter(function (p) { return p.seriesTitle === post.seriesTitle; }).length) {
        console.log('File:', post);
        throw 'Cannot add post duplicate series post - check your grunt configuration.';
      }

      //console.log('pushing:', post.seriesTitle, post.getSiteId());
      series.posts.push(post);

      ++series.totalCount;
      if (post.published === true) {
        ++series.publishedCount;
      }

      //console.log({
      //  'SERIES: ': post.seriesId,
      //  'TITLE: ': post.title,
      //})
    }
    return post;
  };

  Site.prototype.getSiteId = function () {
    return this.siteId;
  };

  Site.prototype.addPost = function (post) {
    if (post) {
      this._posts.push(post);
    }
  };
  Site.prototype.filterPosts = function (posts) {

    var filtered;

    if (this.showUnPublished) {
      filtered = posts;
    } else {
      filtered = posts.filter(function (post) {
        // only exclude posts that are explicitly 'published: false'
        return !(post.published === false); // jshint ignore:line
      });
    }

    return _.sortBy(filtered, _.property('date')).reverse();
  };

  // TODO: recall what enumerable/configurable do...
  Object.defineProperty(Site.prototype, 'recentPosts', {
    get: function () {
      return _.take(this.posts, this.recentPostsConfig.showCount);
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(Site.prototype, 'postsGroupedByYear', {
    get: function () {
      var posts = {};

      this.posts.forEach(function (post) {
        if (!post.date) {
          console.log(post);
          throw 'post missing date property';
        }
        var year = post.date.year();
        var obj = posts[year];
        if (!obj){
          obj = posts[year] = [];
        }

        obj.push(post);
      });

      return Object.keys(posts).sort().reverse().map(function (key) {
        return {
          year: key,
          posts: this.filterPosts(posts[key])
        };
      }.bind(this));
    },
    enumerable: true,
    configurable: true
  });

  Site.prototype.getCategories = function () {
    var categories = {};
    var that = this;

    // this is funky
    // but we're returning a collection of categories (that have a collection of categoryPosts) (cat)
    // where each category

    this.posts.forEach(function (post) {
      (post.categories || []).forEach(function (category) {

        var key = category.name.toLowerCase();
        var cat = categories[key];
        if (cat === undefined) {
          cat = categories[key] = _.create(that, {
            name: category.name,
            file: category.file
        });
          cat.categoryPosts = [];
        }

        cat.categoryPosts.push(post);

        // order the posts by date
        cat.categoryPosts = that.filterPosts(cat.categoryPosts);
      });
    });

    var cats = Object.keys(categories).map(function (key) {
      return categories[key];
    });
    cats.paginator = new Paginator(that, cats);
    return _.sortBy(cats, 'name');
  };


  Object.defineProperty(Site.prototype, 'categories', {
    get: function () {
      return this.getCategories();
    },
    enumerable: true,
    configurable: true
  });

  //// TODO: recall what enumerable/configurable do...
  Object.defineProperty(Site.prototype, 'posts', {
    get: function () {
      return this.filterPosts(this._posts);
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(Site.prototype, 'fullUrl', {
    get: function () {
      var result = joinUrl(this.site.url, this.url);
      return result;
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(Site.prototype, 'date', {
    get: function () {

      if (this._date) {

        var md = moment(this._date);

        if (md.isValid()) {
          return md;
        } else {
          console.log('this._date could not be parsed by momentjs date[' + this._date + '] for[' + this.title + ']');
          return null;
        }
      } else {
        //console.log('this._date is undefined for [' + this.title + ']');
        return null;
      }

    },
    set: function (value) {
      this._date = value;
    },
    enumerable: true,
    configurable: true
  });

  var site = new Site();

  Site.prototype.homePaginator = new Paginator({
    site: site,
    posts: site._posts
  });

  site.Post = Post;
  site.Series = Series;

  return site;
};
