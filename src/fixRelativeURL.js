const { isRelativePath } = require("./isRelativePath");

function fixRelativeURL(url) {

    // console.log(url);
    if (isRelativePath(url) === true) {
        url = 'https:' + url;
    }
    // console.log(url);

    return url;
}

module.exports.fixRelativeURL = fixRelativeURL;