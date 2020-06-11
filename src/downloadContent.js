const fetch = require("node-fetch");

async function download(url) {
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