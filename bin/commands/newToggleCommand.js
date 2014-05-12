var reportError = require('../utils/reportError');
var log = require('../../lib/utils/log.js');
var fs = require('fs');
var path = require('path');
var moment = require('moment');
var exp = function (env) {

    return {
        command: "newToggleCommand <toggleComandsFolder> <name>",
        description: "Can generate a new sample command that allows you to use tog to load and execute.",
        options: [],
        action: function (folder, name, options) {

            if(!fs.existsSync(folder)){
                reportError("Cannot find folder [" + folder + "] to save sample command plugin.");
            }

            var cmdText = fs.readFileSync(path.join(__dirname, "../utils/sampleCommand.js")).toString();
            cmdText = cmdText.replace(/{{name}}/g, name);

            var outFile = path.join(folder, name + '.js');

            fs.writeFileSync(outFile, cmdText);

            log("Plugin scaffolded and saved to: " + outFile);
        },
    }
};

module.exports = exp;
