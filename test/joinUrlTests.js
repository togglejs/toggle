'use strict';
require('approvals').configure({
    reporters: ["visualstudio", "opendiff"]
}).mocha(__dirname);

var joinUrl = require("../lib/util/joinUrl");

it('can join url\'s ', function () {

    var urls = [
        {
            comment: "basic join",
            expected: "basic/join",
            actual: null,
            args: ["basic", "join"],
        },
        {
            comment: "null first",
            expected: "join",
            actual: null,
            args: [null, "join"],
        },
        {
            comment: "null second",
            expected: "basic",
            actual: null,
            args: ["basic", null],
        },
        {
            comment: "null middle",
            expected: "basic/join",
            actual: null,
            args: ["basic", null, "join"],
        },
        {
            comment: "starts with a slash",
            expected: "/basic/join",
            actual: null,
            args: ["/basic", "join"],
        },
        {
            comment: "already has slash",
            expected: "basic/join",
            actual: null,
            args: ["basic", "/join"],
        },
        {
            comment: "slash at end",
            expected: "basic/join/",
            actual: null,
            args: ["basic", "join/"],
        },
        {
            comment: "wrong slash direction to start",
            expected: "/basic/join/",
            actual: null,
            args: ["\\basic\\", "\\join\\"],
        },
        {
            comment: "argument is only a slash",
            expected: "/join",
            actual: null,
            args: ["/", "join"],
        },
    ];

    var result = urls.map(function (item) {
        item.actual = joinUrl.apply(null, item.args);

        if (item.expected !== item.actual) {
            item.ERROR = "!!!!!!!!!!!!!! NOPE !!!!!!!!!!!!!!!!!!!";
        }

        return item;
    });

    this.verifyAsJSON(result);
});
