var expect = require('chai').expect;
var _ = require('lodash');

var site = require('../lib/Site.js')({

    twitter: {
        tweetButton: true,
    }
});


var Post = site.Post;

var sampleContents = "<div>Hello World!</div>";

var pageA = {};
pageA.layout = 'page';
pageA.date = new Date(2011, 1, 1);
pageA.title = "Post A";
pageA.published = true;
pageA.categories = ["a", "post"];
pageA.contents = sampleContents;
pageA.url = "/posta_url";
site.addFile(pageA);

var postA = {};
postA.date = new Date(2011, 1, 1);
postA.title = "Post A";
postA.published = true;
postA.categories = ["a", "post"];
postA.contents = sampleContents;
postA.url = "/posta_url";
site.addFile(postA);

var postB = {};
postB.title = "Post B";
postB.published = false;
postB.date = new Date(2011, 1, 1);
postB.categories = ["b", "post"];
postB.contents = sampleContents;
postB.url = "/postb_url";
site.addFile(postB);

var seriesPost1 = {};
seriesPost1.seriesTitle = "Introduction"
seriesPost1.published = true;
seriesPost1.date = new Date(2011, 1, 1);
seriesPost1.seriesId = 'sample-series';
seriesPost1.seriesAbout = "some series about foo";
seriesPost1.categories = ["series", "post"];
seriesPost1.contents = sampleContents;
seriesPost1.url = "/seriesPost1_url";
site.addFile(seriesPost1);

var seriesPost2 = {};
seriesPost2.seriesTitle = "series post 2";
seriesPost2.published = false;
seriesPost2.date = new Date(2011, 1, 1);
seriesPost2.seriesId = 'sample-series';
seriesPost2.categories = ["series", "post"];
seriesPost2.contents = sampleContents;
seriesPost2.url = "/seriesPost2_url";
site.addFile(seriesPost2);



describe("when using a site", function () {

    describe("with a site", function () {

        it("Should have 4 posts", function () {
            expect(site.posts.length).to.equal(2);
        });

        it("Should not muddy the site context from a post", function () {
            expect(site.title).to.equal(undefined);
        });

        it("first post is valid", function () {
            expect(site.posts[0].title).to.equal("Post A");
        });

        it("post url", function () {
            expect(site.posts[0].url).to.equal("/posta_url");
        });

        it("should override defaults", function () {
            expect(site.posts[0].twitter.tweetButton).to.equal(true);
        });

        it("should generate category objects", function () {

            var categories = site.getCategories();
            var result = _.pluck(categories, "name");

            expect(result).to.eql(['a', 'post', 'series']);
        });

        //it("should get posts for a category", function () {
        //    var post = site.getPostsByCategory('a');
        //    var expectedPost = site.posts[0];

        //    expect(post.length).to.equal(1);
        //    expect(post[0].title).to.equal(expectedPost.title);
        //});

        it("A post should pull categoriesSlugFormat from the site's prototype.", function () {
            expect(site.posts[0].categoriesSlugFormat).to.equal("/blog/categories/{category}/");
        });


        it("A page can access the homePaginator.", function () {
            expect(site.pages[0].homePaginator).to.be.ok;
        });

        //it("A post should have categories.", function () {
        //    expect(site.posts[0].categories).to.eql([
        //        {
        //            name: "a",
        //            url: "/blog/categories/a/"
        //        },
        //        {
        //            name: "post",
        //            url: "/blog/categories/post/"
        //        },
        //    ]);
        //});
    });
});