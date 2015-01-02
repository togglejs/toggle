'use strict';

var Series = function (about) {
  this.posts = [];
  this.about = about;
  this.totalCount = 0;
  this.publishedCount = 0;
};

Series.prototype = {
  about: 'TODO (fill in the series subject/title)',
  getTitle: function (post) {

    // if (post.seriesIndex === 1) {
    //   //console.log(post);
    // }

    return this.about + ' - Part ' + post.seriesIndex + ' - ' + (post.seriesTitle || '(TODO: fill in "title")');
  },
  getPostIndex: function (post) {
    var index = -1;

    for (var i = 0; i < this.posts.length; i++) {

      if (this.posts[i].___postId === post.___postId) {
        index = i;
        break;
      }
    }

    if (index < 0) {
      console.error({
        post: post,
        __postId: post.___postId,
        series: this.posts.map(function (p) { return p.___postId; })
      });
      throw 'Could not find the post in the series with seriesId[' + post.seriesId + '] (see console.error above)';
    }
    //console.log(this.posts.length, index, post._title || post);
    return index;
  }
};

module.exports = Series;
