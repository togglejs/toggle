var fs = require('fs');
var yaml = require('js-yaml');

module.exports.getPage = function (filePath) {
    var data = fs.readFileSync(filePath, 'utf-8');
    var endOfYaml;
    var result = {
        options: {},
        content: data,
        raw: data
    };

    if (data[0] === "-" && data[1] === "-" && data[2] === "-") {
        data = data.substr(3);
        endOfYaml = data.indexOf('\n---\n');
        var crlfNewLines = false;
        if (endOfYaml < 0) {
            endOfYaml = data.indexOf('\r\n---\r\n');
            crlfNewLines = true;
        }
        if (endOfYaml >= 0) {
            var yamlString = data.substr(0, endOfYaml);

            yaml.safeLoadAll(yamlString, function (doc) {
                result.options = doc;
            });

            result.content = data.substr(endOfYaml + (crlfNewLines ? 9 : 5));
        }
    }

    return result;
}