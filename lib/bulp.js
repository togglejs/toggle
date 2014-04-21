var yaml = require( 'js-yaml' );

module.exports.getPage = function ( contents ) {
    var endOfYaml;

    var result = {
        options: {},
        contents: contents,
        raw: contents
    };

    if ( contents[0] === "-" && contents[1] === "-" && contents[2] === "-" ) {
        contents = contents.substr( 3 );
        endOfYaml = contents.indexOf( '\n---\n' );
        var crlfNewLines = false;
        if ( endOfYaml < 0 ) {
            endOfYaml = contents.indexOf( '\r\n---\r\n' );
            crlfNewLines = true;
        }
        if ( endOfYaml >= 0 ) {
            var yamlString = contents.substr( 0, endOfYaml );

            yaml.safeLoadAll( yamlString, function ( doc ) {
                result.options = doc;
            });

            result.contents = contents.substr( endOfYaml + ( crlfNewLines ? 9 : 5 ) );
        }
    }

    return result;
}