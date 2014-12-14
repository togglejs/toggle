'use strict';
require('approvals').configure({
    reporters: ["visualstudio", "opendiff"]
}).mocha(__dirname);

var expect = require('chai').expect;

var wordizeSpecialChars = require("../lib/util/wordizeSpecialChars");

describe('replaces special charasters ', function () {

    var strs = [
        {
            expected: "sharp",
            actual: null,
            args: "#",
        },
        {
            expected: "sharp_hello_sharp",
            actual: null,
            args: "#_hello_#",
        },
        {
            expected: '',
            actual: null,
            args: null,
        },
        {
            expected: "plus",
            args: "+",
        },
        {
            expected: "_", args: "/",
        },

    ];

    strs.forEach(function (item) {

        it("Should replace " + item.args + " with " + item.expected, function () {

            item.actual = wordizeSpecialChars(item.args);

            expect(item.actual).to.equal(item.expected);
        });

    });

});
