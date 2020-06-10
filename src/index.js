const uglify = require("uglify-js");
let extractJS = require("./getscript");
const download = require("./download")

async function minify(scripts) {
    let minifiedScripts = [];
    for (let i = 0; i < scripts.length; i++) {
        let temp = uglify.minify(scripts[i]);
        minifiedScripts.push(temp);
    }
    return minifiedScripts;
}

async function main() {
    const url = 'https://blogvault.net/';
    const body = await download(url);
    let scripts = await extractJS(body);
    let minifiedScripts = minify(scripts);

    console.log(minifiedScripts);
}
main();
