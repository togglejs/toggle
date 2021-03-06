'use strict';
var fs = require('fs');
var xml = require('xml');
var _ = require('lodash');
var moment = require('moment');
var joinUrl = require('../util/joinUrl.js');
var togError = require('./togErrors');

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
        throw 'Key [' + key + '] already exists. Current value[' + this[key] + '] new file [' + value + ']';
      }
      this[key] = fs.readFileSync(value).toString();
    }.bind(templateCollection)
  };
})();

function renderLayout(metadata) {
  var result;
  var layout = metadata.layout;
  if (layout) {
    if (layout === 'none') {
      result = Handlebars.compile(metadata.contents)(metadata);
      return result;
    } else {
      layout = 'layouts/' + layout;

      var template = Handlebars.templates[layout];

      if (!template) {
        throw 'unknown layout: ' + layout;
      }

      result = template(metadata);
      return result;
    }
  } else {

    //console.log(file.contents.toString());
    //var template = Handlebars.compile(file.contents.toString());
    //var result = template(metadata);
    //file.contents = Buffer.from(result);
    console.log(metadata);
    throw 'no layout specified?';
    //if (!pageContext.contents) {
    //  console.log('file:', file);
    //  console.log('pageContext:', pageContext);
    //  throw 'contents:... not defined?';
    //}
    //file.contents = Buffer.from(pageContext.contents);
  }
}

var renderTemplate = function (templateName, context) {
  if (!templateName) {
    throw 'argument[0] templateName was [' + templateName + ']';
  }

  var template = Handlebars.templates[templateName];

  if (!template && typeof template !== 'function') {
    throw 'Could not get template with templateName [' + templateName + '], all known Templates on Handlebars.templates=' + JSON.stringify(Object.keys(Handlebars.templates), null, '  ');
  }

  var result;

  //  try {
  //console.log('template', rawTemplate);
  result = template(context);
  //console.log('result:', result);
  //} catch (e) {
  //  console.error('ERROR: ', {
  //    'templateName:': templateName, 'rawTemplate:': template, 'context:': context, 'error:': e});
  //  //console.error('ERROR: templateName:', templateName);
  //  //console.error('ERROR: context:', context);
  //  //console.error('ERROR: ', e);
  //  throw e;
  //}

  return result;
};

var renderContentGulp = function () {
  var through = require('through2');

  var PLUGIN_NAME = 'tog-renderContent';

  var stream = through.obj(function (file, enc, callback) {

    var metadata = file.togMetadata;
    //console.log(metadata.handlebarCompile)
    if (metadata && metadata.handlebarCompile) {

      if (file.isBuffer()) {
        var contents = file.contents.toString();

        // pre-compile and render the page/post
        var result = Handlebars.compile(contents)(metadata);
        metadata.contents = result;
        file.contents = Buffer.from(result);
      }

      if (file.isStream()) {
        this.emit('error', togError.noStreamSupport(PLUGIN_NAME));
        return callback();
      }
    }

    this.push(file);

    return callback();
  });

  // returning the file stream
  return stream;
};

var renderTemplateGulp = function () {
  var through = require('through2');

  var PLUGIN_NAME = 'tog-renderTemplate';

  var stream = through.obj(function (file, enc, callback) {

    var metadata = file.togMetadata;
    if (metadata) {

      var contents = '';
      if (file.isBuffer()) {
        contents = file.contents.toString();

        // pre-compile and render the page/post
        metadata.contents = contents;
      }

      if (file.isStream()) {
        this.emit('error', togError.noStreamSupport(PLUGIN_NAME));
        return callback();
      }

      var result = renderLayout(metadata);
      file.contents = Buffer.from(result);
    }

    this.push(file);

    return callback();
  });

  // returning the file stream
  return stream;
};

module.exports = function (HandlebarsInput) {

  if (!HandlebarsInput) {
    throw 'must pass the Handlebars object as the first parameter.';
  }

  Handlebars = HandlebarsInput;
  _.extend(Handlebars.helpers, require('diy-handlebars-helpers'));

  Handlebars.registerHelper('include', function (name) {
    //console.log('#include ' + name);
    return renderTemplate(name, this);
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
    return moment(date).toISOString();
  });

  Handlebars.registerHelper('formatDate', function (date, options) {
    var m = moment(this._date);
    if (m.isValid()) {
      if (options.hash.format) {
        return m.format(options.hash.format);
      } else {
        return m.format('MMM Do YYYY');
      }
    }

    throw 'unable to format [' + date + '] as a date';
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

    return joinUrl(this.site.url, url);
  });

  Handlebars.registerHelper('iso8601', function (date) {
    //  {% capture fullUrl %}{{ url }}{{#if permalink '.html'}}{{ url }}{{else}}{{ page.url | remove:'index.html' | strip_slash }}{{/if}}{% endcapture %}

    return moment(date).toISOString();
  });

  Handlebars.registerHelper('postCompare', function (rvalue) {
    if (this.isPublished) {
      if (this.seriesTitle === rvalue.seriesTitle) {
        return '(current) - ' + this.seriesTitle;
      } else {
        return '<a href="' + this.url + '">' + this.seriesTitle + '</a>';
      }
    } else {
      if (this.seriesTitle === rvalue.seriesTitle) {
        return '(current) - ' + this.seriesTitle;
      } else {
        return '(coming soon) - ' + this.seriesTitle;
      }
    }

  });

  Handlebars.registerHelper('compare', function (lvalue, rvalue, options) {

    if (arguments.length < 3) {
      throw new Error('Handlerbars Helper \'compare\' needs 2 parameters');
    }

    var operator = options.hash.operator || '==';

    var operators = {
      '==': function (l, r) { return l == r; }, // jshint ignore:line
      '===': function (l, r) { return l === r; },
      '!=': function (l, r) { return l != r; }, // jshint ignore:line
      '<': function (l, r) { return l < r; },
      '>': function (l, r) { return l > r; },
      '<=': function (l, r) { return l <= r; },
      '>=': function (l, r) { return l >= r; },
      'typeof': function (l, r) { return typeof l == r; } // jshint ignore:line
    };

    if (!operators[operator]) {
      throw new Error('Handlerbars Helper \'compare\' doesn\'t know the operator ' + operator);
    }

    var result = operators[operator](lvalue, rvalue);

    if (result) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }

  });

  return {
    templateCollection: templateCollection,
    renderTemplate: renderTemplate,
    renderLayout: renderLayout,
    renderContentGulp: renderContentGulp,
    renderTemplateGulp: renderTemplateGulp,
  };
};
