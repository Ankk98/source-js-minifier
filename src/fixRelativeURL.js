const { isRelativePath } = require("./isRelativePath");

async function fixRelativeURL(url) {

    if (isRelativePath(url) === true) {
        url = 'https:' + url;
    }

    return url;
}

module.exports.fixRelativeURL = fixRelativeURL;