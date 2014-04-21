var gulp = require('gulp');

var bulp = require('./lib/bulp');

var bulpPlugin = (function() {

    // through2 is a thin wrapper around node transform streams
    var through = require('through2');
    var gutil = require('gulp-util');
    var PluginError = gutil.PluginError;
    // Consts
    var PLUGIN_NAME = 'gulp-bulp';

    var pages = {};

    // Plugin level function(dealing with files)
    function gulpPrefixer() {
        //if (!prefixText) {
        //    throw new PluginError(PLUGIN_NAME, "Missing prefix text!");
        //}

        // Creating a stream through which each file will pass
        var stream = through.obj(function (file, enc, callback) {
            if (file.isNull()) {
                // Do nothing if no contents
            }

            var metadata;


            if (file.isBuffer()) {
                metadata = bulp.getPage(file.contents.toString('utf-8'));

                file.contents = new Buffer(metadata.contents);
            }

            if (file.isStream()) {
                throw new PluginError(PLUGIN_NAME, "Doesn't support streams (yet?)!");
            }

            pages[file.path] = metadata;

            this.push(file);
            return callback();

        });

        // returning the file stream
        return stream;
    };

    // Exporting the plugin main function
    return gulpPrefixer;

})();



gulp.task('default', function () {
    // place code for your default task here

    var liquid = require("gulp-liquid");
    var debug = require('gulp-debug');
    var markdown = require('gulp-markdown');

    return gulp.src("./tests/**/*.md")
        .pipe(bulpPlugin())
        .pipe(debug({verbose: true}))
        .pipe(liquid({
            locals: {
                name: "Jason"
            }
        }))
        .pipe(markdown())
        .pipe(gulp.dest("./dist"));
});
