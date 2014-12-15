'use strict';
var expect = require('chai').expect;
var tog = require('../lib/tog.js');

describe("tog", function () {

    [
        'util.joinUrl',
        'util.wordizeSpecialChars',

        'liquid',
        'loadHandlebarTemplate',
        'templatesHelper',
        'renderSeries',
        'description',
        'site',
        'alias',
        'loadHandlebarTheme',
    ].forEach(function (item) {
        it("should export " + item, function() {
            var pathToItem = item.split('.');

            for (var i = 0; i < pathToItem.length; i++) {
              if (i === 0) {
                expect(tog[pathToItem[0]]).to.be.ok;
              } else if (i === 1){
                expect(tog[pathToItem[0]][pathToItem[1]]).to.be.ok;
              } else if (i === 2){
                expect(tog[pathToItem[0]][pathToItem[1]][pathToItem[2]]).to.be.ok;
              } else if (i === 3){
                expect(tog[pathToItem[0]][pathToItem[1]][pathToItem[2]][pathToItem[3]]).to.be.ok;
              } else if (i === 4){
                expect(tog[pathToItem[0]][pathToItem[1]][pathToItem[2]][pathToItem[3]][pathToItem[4]]).to.be.ok;
              } else {
                throw 'need more namespace checks... namespace too deep - maybe consider less nesting of namespace???';
              }
            }

            // expect(tog[item]).to.be.ok;
        });
    });
});
