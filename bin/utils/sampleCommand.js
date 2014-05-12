module.exports = function (env) {

    // TODO: document what env has that may be useful to a plugin develoepr.

    return {
        command: "{{name}} <sampleRequiredParameter> [sampleOptionalParameter]",
        description: "TODO: fill in command description",
        options: [
            {
                option: "-o, --option <someOption>",
                description: "TODO: add optional command options..."
            }
        ],
        action: function (sampleRequiredParameter, sampleOptionalParameter, options) {
            console.log("HELLO WORLD!");
            console.log("sampleRequiredParameter:" + sampleRequiredParameter);
            console.log("sampleOptionalParameter: " + sampleOptionalParameter);
        },
    }
};