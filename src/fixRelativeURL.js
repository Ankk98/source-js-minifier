const { isRelativePath } = require("./isRelativePath");

function fixRelativeURL(url) {
    // To add https: to the beginning of the url if not present
    console.log(`Add 'https:' to link: ${url}`);
    if (isRelativePath(url) === true) {
        url = 'https:' + url;
    }

    return url;
}

module.exports.fixRelativeURL = fixRelativeURL;