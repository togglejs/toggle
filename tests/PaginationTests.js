var expect = require('chai').expect;
var _ = require('lodash');

var Paginator = require('../lib/App/Paginator')

describe("Paginator", function () {

    var paginator;
    var mockSite = {
        filterPosts: function (posts) {
            return posts;
        }
    };

    var options;

    beforeEach(function () {
        options = {
            site: mockSite,
            posts: [],
            pageSize: 10,
            currentPage: 0
        };
    })


    describe("When there are zero posts", function () {

        var posts = [];

        beforeEach(function () {
            options.posts = posts;
            paginator = new Paginator(options)
        })

        it("should have a paginator", function () {
            expect(paginator).to.be.ok;
        });

        it("should not have a nextPageLink", function () {
            expect(paginator.nextPageLink).to.not.be.ok;
        });

        it("should not have a previousPageLink", function () {
            expect(paginator.previousPageLink).to.not.be.ok;
        });

    })

    describe("When there is one post", function () {

        var posts = [
            {}
        ];

        beforeEach(function () {
            options.posts = posts;
            paginator = new Paginator(options)
        })

        it("should have a paginator", function () {
            expect(paginator).to.be.ok;
        });

        it("should have a post", function () {
            expect(paginator.posts).to.be.ok;
            expect(paginator.posts.length).to.equal(1);
        });

        it("should not have a nextPageLink", function () {
            expect(paginator.nextPageLink).to.not.be.ok;
        });

        it("should not have a previousPageLink", function () {
            expect(paginator.previousPageLink).to.not.be.ok;
        });
    });


    describe("When there are twenty posts", function () {

        var posts = [];

        for (var i = 0; i < 20; i++) {
            posts.push({ id: i });
        }

        beforeEach(function () {
            options.posts = posts;
            paginator = new Paginator(options)
        })

        it("should have a paginator", function () {
            expect(paginator).to.be.ok;
        });

        it("should have a post", function () {
            expect(paginator.posts).to.be.ok;
            expect(paginator.posts.length).to.equal(10);
        });

        it("should have the first post correct", function () {
            expect(paginator.posts[0].id).to.equal(0);
        });

        it("should have the last post correct", function () {
            expect(paginator.posts[9].id).to.equal(9);
        });

        it("should not have a nextPageLink", function () {
            expect(paginator.nextPageLink).to.equal("/blog/page/2");
        });

        it("should not have a previousPageLink", function () {
            expect(paginator.previousPageLink).to.not.be.ok;
        });

        describe("and on page 2", function () {
            beforeEach(function () {
                options.posts = posts;
                options.currentPage = 1;
                paginator = new Paginator(options)
            })

            it("should have a paginator", function () {
                expect(paginator).to.be.ok;
            });

            it("should have a post", function () {
                expect(paginator.posts).to.be.ok;
                expect(paginator.posts.length).to.equal(10);
            });

            it("should have the first post correct", function () {
                expect(paginator.posts[0].id).to.equal(10);
            });

            it("should have the last post correct", function () {
                expect(paginator.posts[9].id).to.equal(19);
            });


            it("should not have a nextPageLink", function () {
                expect(paginator.nextPageLink).to.not.be.ok;
            });

            it("should have a previousPageLink", function () {
                expect(paginator.previousPageLink).to.equal("/blog/page/1");
            });

        });

        describe("and the page size is 5 and the third page", function () {
            beforeEach(function () {
                options.posts = posts;
                options.currentPage = 2;
                options.pageSize = 5;
                paginator = new Paginator(options)
            })

            it("should have a paginator", function () {
                expect(paginator).to.be.ok;
            });

            it("should have a post", function () {
                expect(paginator.posts).to.be.ok;
                expect(paginator.posts.length).to.equal(5);
            });

            it("should have the first post correct", function () {
                expect(paginator.posts[0].id).to.equal(10);
            });

            it("should have the last post correct", function () {
                expect(paginator.posts[4].id).to.equal(14);
            });

            it("should not have a nextPageLink", function () {
                expect(paginator.nextPageLink).to.equal("/blog/page/4");
            });

            it("should have a previousPageLink", function () {
                expect(paginator.previousPageLink).to.equal("/blog/page/2");
            });

            describe("and we've changed the link prefix", function () {
                beforeEach(function () {
                    options.linkPrefix = "test/something/";
                    paginator = new Paginator(options)
                })
                
                it("should have a previousPageLink", function () {
                    expect(paginator.previousPageLink).to.equal("test/something/2");
                });

            });
        });
    });

});