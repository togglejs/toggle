var expect = require('chai').expect;
var bulp = require('../lib/bulp.js');

describe("bulp", function () {

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
            expect(bulp[item]).to.be.ok;
        });
    });

});
