module.exports = function (program, env) {

    /*
     * TODO: document what env has that may be useful to a plugin develoepr.
     * 
     * toggle leverages https://www.npmjs.org/package/commander for it's commands
     * You can review it's API https://github.com/visionmedia/commander.js to extend toggle with your own commands.
     * 
     */
    
    program
      .command("{{name}} <sampleRequiredParameter> [sampleOptionalParameter]")
      .description("TODO: fill in command description")
      .option("-o, --option <someOption>", "TODO: add optional command options...")
      .action(function (sampleRequiredParameter, sampleOptionalParameter, options) {
          console.log("HELLO WORLD!");
          console.log("sampleRequiredParameter:" + sampleRequiredParameter);
          console.log("sampleOptionalParameter: " + sampleOptionalParameter);
      });
};