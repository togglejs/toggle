﻿'use strict';
var glob = require('glob');
var fs = require('fs');
var xml = require('xml');
var _ = require('lodash');
var bulp = require('./bulp');
var moment = require('moment');

var joinUrl = require('./joinUrl.js');

var Handlebars = null;

var templateCollection = (function () {

    var templateCollection = {};

    return {
        getItem: function (key) {
            return templateCollection[key];
        },
        allKeys: function () {
            return Object.keys(templateCollection);
        },
        addTemplate: function (key, value) {
            if (this[key]) {
                throw "Key [" + key + "] already exists. Current value[" + this[key] + "] new file [" + value + "]";
            }
            this[key] = fs.readFileSync(value).toString();
        }.bind(templateCollection)
    };
})();



function renderLayout(fileContents, site) {

    var layout = newContext.layout;
    if (layout) {

        layout = "layouts/" + layout;

        var result = renderTemplateX(layout, newContext);
        return result;

    } else {
        return page.contents;
    }

}


var renderTemplateX = function (templateName, context) {
    if (!templateName) {
        throw "argument[0] templateName was [" + templateName + "]";
    }

    var template = Handlebars.templates[templateName];

    if (!template && typeof template !== "function") {
        throw "Could not get template with templateName [" + templateName + "], all known Templates on Handlebars.templates=" + JSON.stringify(Object.keys(Handlebars.templates), null, '  ');
    }

    var result;

    //    try {
    //console.log('template', rawTemplate);
    result = template(context);
    //console.log('result:', result);
    //} catch (e) {
    //    console.error("ERROR: ", {
    //        "templateName:": templateName, "rawTemplate:": template, "context:": context, "error:": e});
    //    //console.error("ERROR: templateName:", templateName);
    //    //console.error("ERROR: context:", context);
    //    //console.error("ERROR: ", e);
    //    throw e;
    //}

    return result;
}
var renderTemplateGulp = function (siteContext) {
    var through = require('through2');

    if (!siteContext) {
        throw "must provide a Site() context object";
    }

    var PLUGIN_NAME = "bulp-renderTemplate";

    var stream = through.obj(function (file, enc, callback) {
        if (file.isNull()) {
            // Do nothing if no contents
        }

        var metadata = file.bulpMetadata;

        var contents = ""
        if (file.isBuffer()) {
            contents = file.contents.toString();
            metadata.contents = contents;
        }

        if (file.isStream()) {
            throw new PluginError(PLUGIN_NAME, "Doesn't support streams (yet?)!");
        }


        var layout = metadata.layout;
        if (layout) {

            layout = "layouts/" + layout;

            var renderTemplateX = Handlebars.templates[layout];
            //console.log(layout);
            var result = renderTemplateX(metadata);

            file.contents = new Buffer(result);

        } else {
            console.log(metadata);
            throw 'wat?';
            if (!pageContext.contents) {
                console.log("file:", file);
                console.log("pageContext:", pageContext);
                throw "contents:... not defined?";
            }
            file.contents = new Buffer(pageContext.contents);
        }

        this.push(file);

        return callback();
    });

    // returning the file stream
    return stream;
};


module.exports = function (HandlebarsInput) {

    if (!HandlebarsInput) {
        throw "must pass the Handlebars object as the first parameter."
    }

    Handlebars = HandlebarsInput;
    _.extend(Handlebars.helpers, require('diy-handlebars-helpers'));



    Handlebars.registerHelper('include', function (name) {
        //console.log('#include ' + name);
        return renderTemplateX(name, this);
    });

    Handlebars.registerHelper('length', function (array) {
        if (array && array.length > 0) {
            return array.length;
        }
        return 0;
    });


    Handlebars.registerHelper('cdata_escape', function (value) {
        return xml([{ _cdata: value }]);
    });
    

    Handlebars.registerHelper('date_to_xmlschema', function (date) {
        //console.log('date_to_xmlschema', date)
        return moment(this._rawDate).toISOString();
    });

    Handlebars.registerHelper('formatDate', function (date) {
        var m = moment(this._rawDate);
        if (m.isValid()) {
            return m.format("MMM Do YYYY");
        }

        throw "unable to format [" + date + "] as a date";
    });

    Handlebars.registerHelper('category_links', function (date) {
        return "TODO(Category links)";
    });

    Handlebars.registerHelper('json', function (data) {

        var o = {};
        o.o = o;

        var cache = [];
        var result = JSON.stringify(data, function (key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Circular reference found, discard key
                    return;
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
        }, '  ');
        cache = null; // Enable garbage collection

        //console.log('JSON:', data);
        //var result = JSON.stringify(data);
        //console.log('JSON:', result);
        return result;
    });

    Handlebars.registerHelper('fullUrl', function (url) {
        //  {% capture fullUrl %}{{ url }}{{#if permalink '.html'}}{{ url }}{{else}}{{ page.url | remove:'index.html' | strip_slash }}{{/if}}{% endcapture %}

        return joinUrl(this.site.url, this.url);
    });

    Handlebars.registerHelper('postCompare', function (rvalue) {
        if (this.isPublished) {
            if (this.seriesTitle === rvalue.seriesTitle) {
                return "(current) - " + this.seriesTitle;
            } else {
                return '<a href="' + this.url + '">' + this.seriesTitle + '</a>';
            }
        } else {
            if (this.seriesTitle === rvalue.seriesTitle) {
                return "(current) - " + this.seriesTitle;
            } else {
                return "(coming soon) - " + this.seriesTitle;
            }
        }

    });

    Handlebars.registerHelper('compare', function (lvalue, rvalue, options) {

        if (arguments.length < 3)
            throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

        operator = options.hash.operator || "==";

        var operators = {
            '==': function (l, r) { return l == r; },
            '===': function (l, r) { return l === r; },
            '!=': function (l, r) { return l != r; },
            '<': function (l, r) { return l < r; },
            '>': function (l, r) { return l > r; },
            '<=': function (l, r) { return l <= r; },
            '>=': function (l, r) { return l >= r; },
            'typeof': function (l, r) { return typeof l == r; }
        }

        if (!operators[operator])
            throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);

        var result = operators[operator](lvalue, rvalue);

        if (result) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }

    });

    return {
        templateCollection: templateCollection,
        renderTemplate: renderTemplateX,
        renderLayout: renderLayout,
        renderTemplateGulp: renderTemplateGulp,
    }
};