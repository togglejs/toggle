require('approvals').configure({
    reporters: ["visualstudio", "opendiff"]
}).mocha(__dirname);

var wordizeSpecialChars = require("../lib/wordizeSpecialChars");

it('replaces special charasters ', function () {

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
            actual: null,
            args: "+",
        },

    ]

    var result = strs.map(function (item) {
        item.actual = wordizeSpecialChars(item.args);

        if (item.expected !== item.actual) {
            item.ERROR = "!!!!!!!!!!!!!! NOPE !!!!!!!!!!!!!!!!!!!";
        }

        return item;
    });
        
    this.verifyAsJSON(result);
});
