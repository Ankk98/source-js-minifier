function validateURL(url) {
    // To validate correctness of provided URL using regex
    console.log('Validating URL....');
    let pattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    let regex = new RegExp(pattern);
    return regex.test(url);
}

module.exports.validateURL = validateURL;