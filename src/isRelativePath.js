function isRelativePath(url) {
    // To check presence of https: to the url
    let pattern = /^\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    let regex2 = new RegExp(pattern);
    let result = regex2.test(url);
    return result;
}

module.exports.isRelativePath = isRelativePath;