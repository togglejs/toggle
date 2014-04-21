var gulp = require('gulp');

var pages = {};

gulp.task('default', function () {
    // place code for your default task here

    var debug = require('gulp-debug');
    var markdown = require('gulp-markdown');
    var bulp = require('./lib/bulp.js');
    var bulpLiquid = require('./lib/bulp-liquid.js');

    return gulp.src("./tests/**/*.md")
        .pipe(bulp())
        //.pipe(debug({verbose: true}))
        .pipe(bulpLiquid())
        //.pipe(debug({verbose: true}))
        .pipe(markdown())
        .pipe(gulp.dest("./dist"));
});
