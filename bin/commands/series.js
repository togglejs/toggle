'use strict';

var fs = require('fs');
var path = require('path');
var moment = require('moment');

module.exports = function (program, env) {
  var config = env.toggleConfig;

  program
  .command("series <seriesTitle>")
  .description("create a new single-file-series")
  .option("-t, --template <templateName>", "Which template to use? default=series")
  .action(function (seriesTitle, options) {

    seriesTitle = seriesTitle || '';

    if (!seriesTitle) {
      throw new Error("seriesTitle is required. EX: > tog post 'So, one day...'");
    }

    var template = options.template || "series";

    console.log("Using template " + template);

    var templatePath = config.templates[template];
    if (!templatePath || !fs.existsSync(templatePath)) {
      throw new Error("Cannot find template defined in config under { templates[" + template + "] = " + templatePath + " }.");
    }

    var postsOutput = config.paths.posts;
    if (!postsOutput || !fs.existsSync(postsOutput)) {
      throw new Error("Cannot find directory config {\n  paths: { \n    posts: \"" + postsOutput + "\" <-- unknown directory? \n  } \n}");
    }

    var posts = config.posts || {};
    var fileNameFormat = posts.fileNameFormat || (moment().format("YYYY-MM-DD") + "-{{seriesTitle}}");
    var fileExtension = posts.extension || ".md";

    // lower cases and replaces special characters with a dash
    var fileSafeTitleName = seriesTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    var postFileName = fileNameFormat.replace("{{seriesTitle}}", fileSafeTitleName) + fileExtension;

    var postTemplate = fs.readFileSync(templatePath).toString();
    postTemplate = postTemplate.replace(/{{date}}/g, new Date().toISOString());
    postTemplate = postTemplate.replace(/{{seriesTitle}}/g, seriesTitle);
    postTemplate = postTemplate.replace(/{{seriesId}}/g, fileSafeTitleName);

    var outPath = path.join(postsOutput, postFileName);
    console.log("New series post at: " + outPath);

    fs.writeFileSync(outPath, postTemplate);

    // try to handle an after post created command
    // TODO: this doesn't correclty spawn - as it leaves our
    // command stuck waiting for process to complete?
    if (posts.afterPostCreated && posts.afterPostCreated.command) {
      var spawn = require('child_process').spawn;
      var exe = posts.afterPostCreated.command;
      var args = posts.afterPostCreated.args;

      if (!Array.isArray(args)) {
        args = [args];
      }

      args = args.map(function (arg) {
        arg = (arg || '')
          .replace(/{{newPostFileName}}/g, outPath)
          .replace(/{{seriesTitle}}/g, seriesTitle)
          .replace(/{{seriesId}}/g, fileSafeTitleName);
        return arg;
      });

      var ps = spawn(exe, args, {
        detached: true,
        stdio: ['ignore', 'ignore', 'ignore']
      });
      ps.unref();
    }
  });
};
