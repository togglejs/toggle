// Consts
var PLUGIN_NAME = 'bulp-handlebarRender';

module.exports = ( function () {
    var path = require( 'path' );
    var fs = require( 'fs' );

    var gutil = require( 'gulp-util' );
    var PluginError = gutil.PluginError;
    var through = require( 'through2' ); // through2 is a thin wrapper around node transform streams

    // Plugin level function(dealing with files)
    function gulpPrefixer(opts) {
        var templatesDir;
        function liquid( file, enc, callback ) {
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
                template = liquidEngine.parse( file.contents.toString() );
                promise = template.render( file.bulpMetadata.options );

                promise.then( function ( output ) {
                    file.contents = new Buffer( output );
                    this.push( file );
                    callback();
                }.bind( this ), function ( err ) {
                        new PluginError( 'gulp-liquid', 'Error during conversion' );
                });
            }
        }

        return through.obj( liquid );
    };

    // Exporting the plugin main function
    return gulpPrefixer;

})();