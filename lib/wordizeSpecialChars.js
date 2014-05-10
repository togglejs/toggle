
module.exports = function (str) {

    str = str || '';

    str = str.replace(/\+/g, "plus");
    str = str.replace(/#/g, "sharp");

    return str;

}