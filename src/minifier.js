'use strict';
const download = require("./downloadContent");
const fs = require("fs");
const open = require('open');
const { assert } = require("console");
const { concatenateScripts } = require("./concatenateScripts");
const { replaceScriptsWithMinScripts } = require("./replaceScripts");
const { fixRelativeURL } = require("./fixRelativeURL");

// Main function
async function minifier(url, useCustomMinifier, performConcatenation) {

    console.log(`=> URL of source webpage provided: ${url}`);

    let source;
    try {
        // check URL & fix if needed
        if (!validateURL(url)) {
            console.log(`Invalid URL`);
            return;
        }

        url = fixRelativeURL(url);
        // console.log(url);

        //Download & save contents of webpage
        source = await download(url);
        fs.writeFile('./output/source.html', source, () => {
            console.log('=> Source content of given URL saved at ./output/source.html');
        });
    } catch (error) {
        assert(error);
    }

    let newSource;
    try {
        if (performConcatenation) {
            //concatenate scripts, minify & attach
            newSource = await concatenateScripts(source, url, useCustomMinifier);
        } else {
            //replace with minify scripts
            newSource = await replaceScriptsWithMinScripts(source, url, useCustomMinifier);
        }

        // Save new file
        fs.writeFileSync('./output/newSource.html', newSource, () => {
            console.log('=> Source JS code of given URL saved at ./output/newSource.html');
        });
    } catch (error) {
        console.log(error);
        assert(error);
        // return;
    }

    console.log('=> Opening the webpage into the default browser...');
    try {
        await open('./output/newSource.html');
    } catch (error) {
        console.log(error);
        // assert(error);
    }

    console.log('=> Processing Complete, take a look at the browser tab. Exiting.');
}

module.exports.minifier = minifier;





































// module.exports.replaceScriptsWithMinScripts = replaceScriptsWithMinScripts;

// For future reference:
// if (des[i].attrs && des[i].attrs.src != null) {
                //     if (isRelativePath(des[i].attrs.src) === true) {
                //         des[i].attrs.src = 'https:' + des[i].attrs.src;
                //     }
                //     if (!validateURL(des[i].attrs.src)) {
                //         throw new Error(`Invalid URL`);
                //     }

                //     let currText;
                //     try {
                //         currText = await download(des[i].attrs.src);
                //     } catch (error) {
                //         throw error;
                //     }
                //     console.log('Minifying and replacing a script...');
                //     delete des[i].attrs.src;
                //     // console.log(des[i]);
                //     let text = uglify.minify(currText)['code'];
                //     if(text){
                //         des[i].contents.push(new SoupString(text, des[i]));
                //     }else{
                //         des[i].contents.push(new SoupString('', des[i]));
                //     }
                //     // des[i].contents[0]['_text'] = uglify.minify(currText);
                //     console.log(des[i].attrs);
                // }