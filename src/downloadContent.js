const fetch = require("node-fetch");

async function download(url) {
    console.log(`Downloading contents of file at URL: ${url}`);
    return new Promise(async (resolve, reject) => {
        const response = await fetch(url);
        const body = await response.text();
        if (body) {
            resolve(body);
        }
        else {
            reject('Error');
        }
    });
}

module.exports = download;