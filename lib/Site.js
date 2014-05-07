var _ = require('lodash');
var uuid = require('node-uuid');
var joinUrl = require('./joinUrl');

module.exports = function (opts) {

    var postId = 0;

    var defaults = {
        siteTitle: "<TODO: place the name of your site here>",
        blogSlugFormat: "/:year/:month/:title/",
        categoriesSlugFormat: "/blog/categories/{category}/",
        root_url: "http://example.com",
        author: {
            name: "(TODO put your name ex: Bugs Bunny)",
            email: "", //optional email
            link: "", // optional
        },
        year: new Date().getFullYear().toString(),
        titlecase: false,
        assets: "",
        page_meta: true,

        showUnPublished: false,

        subscribe_email: "",

        simple_search: "https://www.google.com/search",

        sidebar_collapse: false, // TODO: test this.
        sidebar: true,

        recentPostsConfig: {
            show: true,
            showCount: 7
        },

        github: {
            username: "",
            repoCount: 5,
            skipForks: true,
            showProfileLink: false,
        },

        twitter: {
            username: "",
            widgetId: "",
            tweetButton: false,
            followButton: false,
        },

        facebook: {
            likeButton: false,
            appId: "",
        },

        google: {
            username: "",
            plusOneButton: false,
            plusOneSize: "medium",

            analyticsTrackingId: "",
        },

        disqus: {
            show: true,
            shortName: "",
        },

        pages: [],
        seriesList: {},

        addFile: function (post) {
            ++postId;

            // TODO: 
            // guard against someone calling this with duplicate files (from gulp selector selectors)... 
            // (I did it while building this and cauzed some crazy bugs).

            if (post.layout === "page" || post.layout === "default") {
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

                if (series.posts.filter(function (p) { p.seriesTitle === post.seriesTitle; }).length) {
                    console.log("File:", post);
                    throw "Cannot add post duplicate series post - check your grunt configuration."
                }

                //console.log('pushing:', post.seriesTitle, post.getSiteId());
                series.posts.push(post);

                ++series.totalCount;
                if (post.published === true) {
                    ++series.publishedCount;
                }

                //console.log({
                //    "SERIES: ": post.seriesId,
                //    "TITLE: ": post.title,
                //})


            }
            return post;
        },
        getSiteId: function () {
            return this.siteId;
        },
        addPost: function (post) {
            if (post) {
                this._posts.push(post);
            }
        }
    };

    var Site = function () {
        this.siteId = uuid.v4();
        this._posts = [];
    }
    Site.prototype = _.merge(defaults, opts);

    // TODO: recall what enumerable/configurable do...
    Object.defineProperty(Site.prototype, "recentPosts", {
        get: function () {
            return _.take(_.sortBy(this.posts, _.property("date")).reverse(), this.recentPostsConfig.showCount);
            //return _.chain(this.posts)
            //        // TODO: be sure we're sorting correctly...
            //        //.sortBy(function(post){
            //        //    console.log("arguments:", arguments);
            //        //    return -1;
            //        //})
            //        //.sortBy("date")
            //        .reverse()
            //        .take(this.recentPostsConfig.showCount);
        },
        enumerable: true,
        configurable: true
    });

    Site.prototype.getCategories = function () {
        var categories = {};
        this.posts.forEach(function (post) {
            (post.categories || []).forEach(function (category) {
                if (categories[category.name] === undefined) {
                    categories[category.name] = 0;
                }
                categories[category.name]++;
            });
        });

        var result = Object.keys(categories).sort(function(a,b){
            return (a.toLowerCase() > b.toLowerCase()) ? 1 : -1;
        });
        return result;
    }

    Site.prototype.getPostsByCategory = function (category) {
        var posts = [];
        this.posts.forEach(function (post) {
            if (post.categories) {
                if (_.any(post.categories, {name:category})) {
                    posts.push(post);
                }
            }
        });

        return posts;
    }

    //// TODO: recall what enumerable/configurable do...
    Object.defineProperty(Site.prototype, "posts", {
        get: function () {

            if (this.showUnPublished) {
                return this._posts;
            }

            return this._posts.filter(function (post) {
                // only exclude posts that are explicitly 'published: false'
                return !(post.published === false);
            });
        },
        enumerable: true,
        configurable: true
    });


    Object.defineProperty(Site.prototype, "fullUrl", {
        get: function () {
            var result = joinUrl(this.site.url, this.url);
            return result;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Site.prototype, "date", {
        get: function () {

            if (this._date) {

                var md = moment(this._date);

                if (md.isValid()) {
                    return md;
                } else {
                    console.log("this._date could not be parsed by momentjs date[" + this._date + "] for[" + this.title + "]");
                    return null;
                }
            } else {
                console.log("this._date is undefined for [" + this.title + "]");
                return null;
            }

        },
        set: function (value) {
            _date = value;
        },
        enumerable: true,
        configurable: true
    });

    var Post = function (site, opts) {
        if (!site) {
            throw "first parameter {site} missing (required)";
        }

        var Post = function () { }

        Post.prototype = _.create(site, {
            index: false,
            comments: true,
            titlecase: false,
            page_header: true,
            page_meta: true,
            sharing: true,
        });

        Object.defineProperty(Post.prototype, "isPublished", {
            get: function () {
                // detect explicit "published===false" - all others are true (even undefined/null)
                return !(this.published === false);
            },
            enumerable: true,
            configurable: true
        });

        Post.prototype.isSeries = function () {
            return !!this.seriesId;
        };
        ////// TODO: recall what enumerable/configurable do...
        //Object.defineProperty(Post.prototype, "isSeries", {
        //    get: function () {
        //        return this._seriesId
        //    },
        //    set: function (value) { this._seriesId = (value || '').trim(); },
        //    enumerable: true,
        //    configurable: true
        //});

        //// TODO: recall what enumerable/configurable do...
        Object.defineProperty(Post.prototype, "seriesId", {
            get: function () {
                return this._seriesId
            },
            set: function (value) { this._seriesId = (value || '').trim(); },
            enumerable: true,
            configurable: true
        });

        //// TODO: recall what enumerable/configurable do...
        Object.defineProperty(Post.prototype, "seriesIndex", {
            get: function () {
                if (this.series) {
                    return this.series.getPostIndex(this) + 1;
                }
                return null;
            },
            enumerable: true,
            configurable: true
        });

        // TODO: recall what enumerable/configurable do...
        Object.defineProperty(Post.prototype, "hasCategories", {
            get: function () {
                return this.categories && this.categories.length;
            },
            enumerable: true,
            configurable: true
        });
        
        Object.defineProperty(Post.prototype, "categories", {
            get: function () {
                return this._categories || [];
            },
            set: function (values) {
                if (Array.isArray(values)) {

                    var slugFormat = this.categoriesSlugFormat;

                    if (!slugFormat) {
                        throw "site.categorySlugFormat is not defined";
                    }

                    this._categories = values.map(function (item) {
                        return {
                            url: encodeURI(slugFormat.replace("{category}", item)).toLowerCase(),
                            name: item
                        };
                    }.bind(this));
                } else {
                    // we can ignore null/undefined - but warn with an error for other objects?
                    if (values !== null && values !== undefined) {
                        console.error("ERROR: categories value [" + JSON.stringify(values) + "] was not an array. Categories expects an array of values.");
                    }
                }
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Post.prototype, "previous", {
            get: function () {
                var index = (this.posts.indexOf(this));
                --index;
                var previousPost = this.posts[index];
                return previousPost;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Post.prototype, "next", {
            get: function () {
                var index = (this.posts.indexOf(this));
                ++index;
                var nextPost = this.posts[index];
                return nextPost;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Post.prototype, "title", {
            get: function () {
                if (this.isSeries()) {

                    //console.log("seriesList:", this.seriesList);
                    //console.log("seriesId:", this.seriesId);


                    //console.log((new Error()).stack);
                    var series = this.seriesList[this.seriesId];
                    if (!series) {
                        console.log(this.seriesList)
                        throw "cannot find series object with seriesId[" + this.seriesId + "]";
                    }
                    return series.getTitle(this);
                }
                return this._title;
            },
            set: function (value) {
                this._title = value;
            },
            enumerable: true,
            configurable: true
        });

        return _.create(Post.prototype, opts);
    }


    var Page = function (site, opts) {

        var Page = function () { }

        Page.prototype = _.create(site, {
            index: true,
            comments: false,
            titlecase: false,
            page_header: true,
            page_meta: true,

            disqus: {
                show: false,
            }
        });

        Object.defineProperty(Page.prototype, "date", {
            get: function () {
                return this._rawDate && moment(this._rawDate);
            },
            //set: function (value) {
            //    var parsedDate = moment(value);
            //    if (parsedDate.isValid()) {
            //        this._date = parsedDate;
            //    } else {
            //        console.error("INVALID Date: " + value);
            //        // date not necessary for a page...
            //    }
            //},
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Page.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (value) {
                this._title = value;
            },
            enumerable: true,
            configurable: true
        });

        var result = _.create(Page.prototype, opts);
        return result;
    }

    var Series = function (about) {
        this.posts = [];
        this.about = about;
        this.totalCount = 0;
        this.publishedCount = 0;
    };

    Series.prototype = {
        about: "TODO (fill in the series subject/title)",
        getTitle: function (post) {

            if (post.seriesIndex === 1) {
                //console.log(post);
            }

            return this.about + " - Part " + post.seriesIndex + " - " + (post.seriesTitle || '(TODO: fill in "title")');
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
                })
                throw "Could not find the post in the series with seriesId[" + post.seriesId + "] (see console.error above)";
            }
            //console.log(this.posts.length, index, post._title || post);
            return index;
        }
    };


    var site = new Site();

    var Paginator = function (site) {
        this.site = site;
    }

    Object.defineProperty(Paginator.prototype, "posts", {
        get: function () {
            return this.site.posts.slice(0, 10);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Paginator.prototype, "nextPageLink", {
        get: function () {
            return "TODO";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Paginator.prototype, "previousPageLink", {
        get: function () {
            return "TODO";
        },
        enumerable: true,
        configurable: true
    });

    site.paginator = new Paginator(site);

    site.Post = Post;
    site.Series = Series;

    return site;
};
