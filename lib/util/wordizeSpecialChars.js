'use strict';

module.exports = function(str) {

  str = str || '';

  str = str.replace(/\+/g, 'plus');
  str = str.replace(/\//g, '_');
  str = str.replace(/#/g, 'sharp');

  return str;
};
