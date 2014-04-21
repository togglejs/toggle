var fs = require('fs');
var yaml = require('js-yaml');

module.exports.getPage = function (filePath) {
    var data = fs.readFileSync(filePath, 'utf-8');

    var result = {
        options: null,
        content: null,
        raw: data
    };

    var sectionIndex = 0;
    yaml.safeLoadAll(data, function (doc) {

        if (sectionIndex === 0) {
            result.options = doc;
        } else if (sectionIndex === 1) {
            result.content = doc;
        } else {
            throw "yaml.saveLoadAll - loading more than 2 sections (1:options, 2:blog content, 3:? = " + doc;
        }

        sectionIndex++;
    });

    return result;
}