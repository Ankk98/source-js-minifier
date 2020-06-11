const uglify = require("uglify-js");
const fs = require("fs");
const extractJS = require("./extractScripts");
const download = require("./downloadContent")

async function minify(scripts) {
    let minifiedScripts = [];
    for (let i = 0; i < scripts.length; i++) {
        if (scripts[i] != null) {
            let temp = uglify.minify(scripts[i]);
            if(temp != null){
                minifiedScripts.push(temp);
            }
        }
    }
    return minifiedScripts;
}

async function app(url) {
    const body = await download(url);
    fs.writeFile('./downloads/source.html', body, () => {
        console.log('Source content of given URL saved at ./downloads/source.html');
    });
    let scripts = await extractJS(body);
    let minifiedScripts = await minify(scripts);

    let combinedScript = '';
    minifiedScripts.forEach(element => {
        combinedScript = combinedScript.concat(element['code']);
        combinedScript = combinedScript.concat('\n');
    });

    fs.writeFile('./downloads/combined.min.js', combinedScript, () => {
        console.log('Source content of given URL saved at ./downloads/combined.min.js');
    });
}

module.exports = app;
