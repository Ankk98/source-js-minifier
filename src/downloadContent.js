const fetch = require("node-fetch");

// To download files from given URLs
async function download(url) {
    console.log(`Downloading contents of file at URL: ${url}`);
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(url);
        const body = await response.text();
        resolve(body);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = download;