const uglify = require("uglify-js");
const fs = require("fs");
const extractJS = require("./extractScripts");
const download = require("./downloadContent")
const open = require('open');

async function minify(scripts) {
    console.log('=> Minifying all the scripts...');
    let minifiedScripts = [];
    for (let i = 0; i < scripts.length; i++) {
        let temp = uglify.minify(scripts[i]);
        minifiedScripts.push(temp);
    }
    return minifiedScripts;
}

async function app(url) {
    console.log(`=> URL of source webpage provided: ${url}`);
    const body = await download(url);

    fs.writeFile('./downloads/source.html', body, () => {
        console.log('=> Source content of given URL saved at ./downloads/source.html');
    });

    let scripts = await extractJS(body);

    fs.writeFile('./downloads/combined.js', scripts, () => {
        console.log('=> Source JS code of given URL saved at ./downloads/combined.js');
    });

    let minifiedScripts = await minify(scripts);

    let combinedScript = '';
    minifiedScripts.forEach(element => {
        combinedScript = combinedScript.concat(element['code']);
        combinedScript = combinedScript.concat('\n');
    });

    fs.writeFile('./downloads/combined.min.js', combinedScript, () => {
        console.log('=> Source content of given URL saved at ./downloads/combined.min.js');
    });

    console.log('=> Opening the webpage into the default browser...');
    await open('./downloads/source.html');

    console.log('=> Processing Complete, take a look at the browser tab. Exiting.');
}

module.exports = app;
