// Consts
var PLUGIN_NAME = 'bulp-handlebarRender';

module.exports = ( function () {
    var path = require( 'path' );
    var fs = require( 'fs' );

    var gutil = require( 'gulp-util' );
    var PluginError = gutil.PluginError;
    var through = require( 'through2' ); // through2 is a thin wrapper around node transform streams

    // Plugin level function(dealing with files)
    return function (opts) {
        var templatesDir;
        return through.obj(function ( file, enc, callback ) {
            var template;
            var promise;

            if(!templatesDir) {
                templatesDir = path.resolve(".", opts && opts.templatesDir);
                if ( !fs.existsSync( templatesDir ) ) {
                    throw new PluginError( PLUGIN_NAME, "Templates directory not found [" + templatesDir + "]" );
                }
            }

            if ( file.isNull() ) {
                return callback();
            }

            if ( file.isStream() ) {
                this.emit( "error", new PluginError( PLUGIN_NAME, "Stream content is not supported" ) );
                return callback();
            }

            if ( file.isBuffer() ) {
                var layout = file.bulpMetadata.options.layout;
                if(layout) {
                    console.log('layout: ', layout);
                    var Handlebars = opts.Handlebars;
                    if(!Handlebars) {
                        throw "Must provide version of Handlebars. opts.Handlebars";
                    }
                    var templatePath = path.join(templatesDir, layout);
                    template = require(templatePath);
                    var templateString = template( file.bulpMetadata );
                    //console.log(templateString);
                    file.contents = new Buffer(templateString);
                    this.push( file );
                    callback();
                } else {
                    throw "Default layout not specified?";
                }
            }
        });
    };

})();