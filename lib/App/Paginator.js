var _ = require('lodash');

var Paginator = function (options) {
    this._site = options.site;
    this._pageSize = options.pageSize || 10;
    this._posts = options.posts;
    this._currentPage = options.currentPage || 0;
    this._linkPrefix = options.linkPrefix || "/blog/pages/";
}

Object.defineProperty(Paginator.prototype, "posts", {
    get: function () {

        var posts = this._site.filterPosts(this._posts);

        return _.chain(posts)
            .rest(this._pageSize * this._currentPage)
            .take(this._pageSize)
            .value();
    },
    enumerable: true,
    configurable: true
});

Object.defineProperty(Paginator.prototype, "nextPageLink", {
    get: function () {

        if (this._posts.length <= ((this._currentPage * this._pageSize) + this._pageSize)) {
            return null;
        }
        return this._linkPrefix + (this._currentPage + 2) + '/';
    },
    enumerable: true,
    configurable: true
});


Object.defineProperty(Paginator.prototype, "currentPage", {
    get: function () {
        return this._currentPage || 0;
    },
    set: function (value) {
        this._currentPage = value || 0;
    },
    enumerable: true,
    configurable: true
});

Object.defineProperty(Paginator.prototype, "previousPageLink", {
    get: function () {

        if ((this._currentPage - 1) < 0) {
            return null;
        }
        
        return this._linkPrefix + this._currentPage + '/';
    },
    enumerable: true,
    configurable: true
});

module.exports = Paginator;