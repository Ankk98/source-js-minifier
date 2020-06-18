'use strict';
const download = require("./downloadContent");
const fs = require("fs");
const open = require('open');
const { concatenateScripts } = require("./concatenateScripts");
const { replaceScriptsWithMinScripts } = require("./replaceScripts");
const { fixRelativeURL } = require("./fixRelativeURL");
const { validateURL } = require("./validateURL");

// Main function
async function minifier(url, useCustomMinifier, performConcatenation, doMinifyCSS) {

    console.log(`=> URL of source webpage provided: ${url}`);

    let source;
    try {
        // check URL & fix if needed
        if (!validateURL(url)) {
            console.error(`Invalid URL`);
            return;
        }

        url = fixRelativeURL(url); // check & fix url

        // Download & save contents of webpage
        source = await download(url);
        if (!fs.existsSync('./output')) {
            fs.mkdirSync('./output'); // create output folder if not already present
        }
        fs.writeFile('./output/source.html', source, () => {
            console.log('=> Source content of given URL saved at ./output/source.html');
        });
    } catch (error) {
        console.error(error);
        return;
    }

    let newSource;
    try {
        if (performConcatenation) {
            // concatenate scripts, minify & attach
            newSource = await concatenateScripts(source, url, useCustomMinifier, doMinifyCSS);
        } else {
            // replace with minify scripts
            newSource = await replaceScriptsWithMinScripts(source, url, useCustomMinifier, doMinifyCSS);
        }
    } catch (error) {
        console.error(error);
        return;
    }

    try {
        // Save new file
        fs.writeFileSync('./output/newSource.html', newSource);
        console.log('=> Source JS code of given URL saved at ./output/newSource.html');
    } catch (error) {
        console.error(error);
        return;
    }

    console.log('=> Opening the webpage into the default browser...');
    try {
        await open('./output/newSource.html');
    } catch (error) {
        console.error(error);
        return;
    }

    console.log('=> Processing Complete, take a look at the browser tab. Exiting.');
}

module.exports.minifier = minifier;