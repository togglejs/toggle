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
        'wordizeSpecialChars',
        'loadHandlebarTheme',
    ].forEach(function (item) {
        it("should export " + item, function() {
            expect(tog[item]).to.be.ok;
        });
    });

});
