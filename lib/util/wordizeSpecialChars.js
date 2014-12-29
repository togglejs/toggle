'use strict';

/**
*
* Helper that replaces some characters with a url safe word or other
* character - used primarily to generate url-safe category names.
*
* - `+` -> `plus`
* - `#` -> `sharp`
* - `/` -> `_`
*
* @param {String} str string to apply token replacements on
* @returns {String} token-replaced string
*/
module.exports = function(str) {

  str = str || '';

  str = str.replace(/\+/g, 'plus');
  str = str.replace(/\//g, '_');
  str = str.replace(/#/g, 'sharp');

  return str;
};
