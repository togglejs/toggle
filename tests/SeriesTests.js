var expect = require('chai').expect;


describe("when using an app", function () {
    var app;
    var seriesPost1;
    var seriesPost2;
    var site

    beforeEach(function () {

        app = require('../lib/App.js')({

            twitter: {
                tweetButton: true,
            }
        });

        var sampleContents = "<div>Hello World!</div>";
        site = app.site;
        site.showUnPublished = true;
        var Post = app.Post;

        seriesPost1 = new Post();
        seriesPost1.date = new Date(2011, 1, 1);

        seriesPost1.seriesTitle = "Introduction"
        seriesPost1.seriesId = 'sample-series';
        seriesPost1.seriesAbout = "some series about foo";
        seriesPost1.categories = ["series", "post"];
        seriesPost1.contents = sampleContents;
        seriesPost1.url = "/seriesPost1_url";

        seriesPost2 = new Post();
        seriesPost2.date = new Date(2011, 1, 1);
        seriesPost2.categories = ["series", "post"];
        seriesPost2.contents = sampleContents;
        seriesPost2.url = "/seriesPost2_url";

        seriesPost2.seriesTitle = "series post 2";
        seriesPost2.seriesId = 'sample-series';
    })

    describe("When adding first post", function () {

        beforeEach(function () {
            site.addFile(seriesPost1);
        })

        it("Should have correct number of posts", function () {
            expect(site.posts.length).to.equal(1);
        });

        describe("with the series object", function () {
            var series;

            beforeEach(function () {
                series = site.seriesList['sample-series'];
            });

            it("Should have a series object", function () {
                expect(series).to.be.ok;
            });

            it("Should have a series object", function () {
                expect(series.totalCount).to.equal(1);
            });

            it("Should have a series object", function () {
                expect(series.publishedCount).to.equal(0);
            });

            it("Should have the posts for the series", function () {
                expect(series.posts.length).to.equal(1);
            });
        })
    });


    describe("When adding two posts with one published. post", function () {

        beforeEach(function () {
            seriesPost1.published = true;
            site.addFile(seriesPost1);
            site.addFile(seriesPost2);
        })

        it("Should have correct number of posts", function () {
            expect(site.posts.length).to.equal(2);
        });

        describe("with the series object", function () {
            var series;

            beforeEach(function () {
                series = site.seriesList['sample-series'];
            });

            it("Should have a series object", function () {
                expect(series).to.be.ok;
            });

            it("Should have a series object", function () {
                expect(series.totalCount).to.equal(2);
            });

            it("Should have a series object", function () {
                expect(series.publishedCount).to.equal(1);
            });

            it("Should have the posts for the series", function () {
                expect(series.posts.length).to.equal(2);
            });

            it("Should have the posts in the right order", function () {
                //console.log(series);
                expect(series.posts[0].title).to.equal("some series about foo - Part 1 - Introduction");
                expect(series.posts[1].title).to.equal("some series about foo - Part 2 - series post 2");
            });

            it("Should retrieve the correct index values", function () {
                expect(series.posts[0].seriesIndex).to.equal(1);
                expect(series.posts[1].seriesIndex).to.equal(2);
            });

        })
    });
});