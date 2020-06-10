const jssoup = require("jssoup").default;
const download = require("./download");

async function extractJS(body) {

    let soup = new jssoup(body);
    scripts = soup.findAll('script');

    let scriptURLs = [];

    scripts.forEach(element => {
        if (element.attrs.src != null) {
            scriptURLs.push(element.attrs.src);
        }
    });
    let scriptTexts = [];
    scripts.forEach(element => {
        if (element.text != (null | '')) {
            scriptTexts.push(element.text);
        }
    });

    for (let i = 0; i < scriptURLs.length; i++) {
        let temp = await download(scriptURLs[i]);
        scriptTexts.push(temp);
    }

    return scriptTexts;
}

module.exports = extractJS;
