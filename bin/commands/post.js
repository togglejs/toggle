'use strict';
var reportError = require('../util/reportError');
var log = require('../../lib/util/log.js');
var fs = require('fs');
var path = require('path');
var moment = require('moment');

module.exports = function (program, env) {
    var config = env.toggleConfig;

    program
      .command("post <title>")
      .description("create a new post")
      .option("-t, --template <templateName>", "Which template to use?")
      .action(function (title, options) {

          title = title || '';

          if (!title) {
              reportError("post title is required. EX: > tog post 'So, one day...'");
          }

          var template = options.template || "post";

          log("Using template " + template);

          var templatePath = config.templates[template];
          if (!templatePath || !fs.existsSync(templatePath)) {
              reportError("Cannot find template defined in config under { templates[" + template + "] = " + templatePath + " }.");
          }

          var postsOutput = config.paths.posts;
          if (!postsOutput || !fs.existsSync(postsOutput)) {
              reportError("Cannot find directory config {\n  paths: { \n    posts: \"" + postsOutput + "\" <-- unknown directory? \n  } \n}");
          }

          var posts = config.posts || {};
          var fileNameFormat = posts.fileNameFormat || (moment().format("YYYY-MM-DD") + "-{{title}}");
          var fileExtension = posts.extension || ".md";

          // lower cases and replaces special characters with a dash
          var fileSafeTitleName = title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
          var postFileName = fileNameFormat.replace("{{title}}", fileSafeTitleName) + fileExtension;

          var postTemplate = fs.readFileSync(templatePath).toString();
          postTemplate = postTemplate.replace(/{{title}}/g, title);
          postTemplate = postTemplate.replace(/{{date}}/g, new Date().toISOString());

          var outPath = path.join(postsOutput, postFileName);
          log("New post at: " + outPath);

          fs.writeFileSync(outPath, postTemplate);

          // try to handle an after post created command
          // TODO: this doesn't correclty spawn - as it leaves our
          // command stuck waiting for process to complete?
          if (posts.afterPostCreated && posts.afterPostCreated.command) {
              var childProcess = require('child_process');
              var spawn = childProcess.spawn;
              var exe = posts.afterPostCreated.command;
              var args = posts.afterPostCreated.args;

              if (!Array.isArray(args)) {
                  args = [args];
              }

              args = args.map(function (arg) {
                  return (arg || '').replace(/{{newPostFileName}}/g, outPath);
              });

              var ps = spawn(exe, args, {
                  detached: true
              });

              ps.stdout.on('data', function (data) {
                  console.log('reporter stdout: ' + data);
              });

              ps.stderr.on('data', function (data) {
                  console.log('reporter stderr: ' + data);
              });
          }
      });
};
