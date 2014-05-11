var expect = require('chai').expect;
var tog = require('../lib/tog.js');

describe("tog", function () {

    [
        'joinUrl',
        'liquid',
        'loadHandlebarTemplate',
        'templatesHelper',
        'renderSeries',
        'description',
        'site',
        'alias',
        'filterext',
        'wordizeSpecialChars',
    ].forEach(function (item) {
        it("should export " + item, function() {
            expect(tog[item]).to.be.ok;
        });
    });

});
